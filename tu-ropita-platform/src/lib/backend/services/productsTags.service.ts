import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { categoryRepository } from "@/lib/backend/persistance/category.repository";
import { productRepository } from "@/lib/backend/persistance/products.repository";
import { productTagsRepository } from "@/lib/backend/persistance/productsTags.repository";
import { tagsRepository } from "@/lib/backend/persistance/tags.repository";
import { openAIService } from "@/lib/backend/services/openAI.service";
import { TagNotFoundException } from "../exceptions/tagNotFound.exception";
import {productService} from "@/lib/backend/services/product.service";

export interface IProductsTagsService {
    tagPendingProducts(): Promise<void>;
    tagPendingProductsByBrand(brandId: number): Promise<void>;
    tagProductByCategoryName(tags: string[], categoryName : string ,productId: number): Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class ProductsTagsService implements IProductsTagsService {

    async tagPendingProducts(): Promise<void> {
        const pendingProductsToTag : IProduct[] = await productRepository.listProducts({tagged: false});
        await this.tagProducts(pendingProductsToTag);
    }

    async tagProductByCategoryName(tags: string[], categoryName: string, productId: number): Promise<void> {
        const category = await categoryRepository.getCategoryByName(categoryName);

        if (!category) {
            throw new Error(`Category ${categoryName} not found`);
        }

        const tagObjects: ITag[] = await Promise.all(
            tags.map(async (tagName) => {
                try {
                    let tag = await tagsRepository.getTagByName(tagName);
                    if (!tag) {
                        await tagsRepository.insertTagsByCategoryId([tagName], category.id);
                        tag = await tagsRepository.getTagByName(tagName);
                    }
                    return tag;
                } catch (error) {
                    if (error instanceof TagNotFoundException) {
                        console.warn(`Tag "${tagName}" not found. Creating a new tag.`);
                        await tagsRepository.insertTagsByCategoryId([tagName], category.id);
                        return await tagsRepository.getTagByName(tagName);
                    }
                    throw error;
                }
            })
        );

        await productTagsRepository.insertTagsToProduct(tagObjects, productId);
    }


    async tagPendingProductsByBrand(brandId: number): Promise<void> {
        const iListProductResponseDto = (await productService.listProducts({brandId: brandId}));
        if(iListProductResponseDto){
            await this.tagProducts(iListProductResponseDto.products);
        }
    }

    private async tagProducts(products: IProduct[]): Promise<void> {
        for (const prod of products) {
            const toTag = `brand:${prod.brand}, description:${prod.description}, name: ${prod.name}`;
            openAIService.runAssistant(toTag).then(
                aiResponse => {
                    if (aiResponse) {
                        console.log(`GPT respose ${JSON.stringify(aiResponse)}`)

                        for (const [categoryName, tags] of Object.entries(aiResponse)) {
                            if (tags && tags.length > 0) {
                                this.tagProductByCategoryName(tags, categoryName, prod.id);
                            }
                        }
                        productRepository.markProductAsTagged(prod.id);
                    }
                }
            );
        }
    }
}

export const productTagsService: IProductsTagsService = new ProductsTagsService()