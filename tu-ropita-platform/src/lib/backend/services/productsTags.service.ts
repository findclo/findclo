import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { categoryRepository, ICategoryRepository } from "@/lib/backend/persistance/category.repository";
import { IProductRepository, productRepository } from "@/lib/backend/persistance/products.repository";
import { IProductsTagsRepository, productTagsRepository } from "@/lib/backend/persistance/productsTags.repository";
import { ITagRepository, tagsRepository } from "@/lib/backend/persistance/tags.repository";
import { IAIService, openAIService } from "@/lib/backend/services/openAI.service";
import { TagNotFoundException } from "../exceptions/tagNotFound.exception";

export interface IProductsTagsService {
    tagPendingProducts(): Promise<void>;
    tagProductByCategoryName(tags: string[], categoryName : string ,productId: string): Promise<void>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class ProductsTagsService implements IProductsTagsService {
    
    private repository: IProductsTagsRepository;
    private productsRepository: IProductRepository;
    private tagsRepository: ITagRepository;
    private aiService : IAIService;
    private categoryRepository: ICategoryRepository;

    constructor(repository: IProductsTagsRepository, productsRepository: IProductRepository, tagsRepository: ITagRepository, aiService : IAIService, categoryRepository : ICategoryRepository) {
        this.repository = repository;
        this.productsRepository = productsRepository;
        this.aiService = aiService;
        this.tagsRepository = tagsRepository;
        this.categoryRepository =  categoryRepository;
    }


    async tagPendingProducts(): Promise<void> {
        const pendingProductsToTag : IProduct[] = await this.productsRepository.listProducts({tagged: false});

        for (const prod of pendingProductsToTag) {
            if(prod.description) {
                // TODO Agregar nombre, marca etc al prompt
                const aiResponse : IAITagsResponse = await this.aiService.runAssistant(prod.description);
                console.log(`GPT respose ${JSON.stringify(aiResponse)}`)
                if (aiResponse) {

                    for (const [categoryName, tags] of Object.entries(aiResponse)) {
                        if (tags && tags.length > 0) {
                            await this.tagProductByCategoryName(tags, categoryName, prod.id);
                        }
                    }

                    this.productsRepository.markProductAsTagged(prod.id);
                    console.log(aiResponse)
                }
            }
        }

    }

    async tagProductByCategoryName(tags: string[], categoryName: string, productId: string): Promise<void> {
        const category = await this.categoryRepository.getCategoryByName(categoryName);

        if (!category) {
            throw new Error(`Category ${categoryName} not found`);
        }

        const tagObjects: ITag[] = await Promise.all(
            tags.map(async (tagName) => {
                try {
                    let tag = await this.tagsRepository.getTagByName(tagName);
                    if (!tag) {
                        await this.tagsRepository.insertTagsByCategoryId([tagName], category.id);
                        tag = await this.tagsRepository.getTagByName(tagName);
                    }
                    return tag;
                } catch (error) {
                    if (error instanceof TagNotFoundException) {
                        console.warn(`Tag "${tagName}" not found. Creating a new tag.`);
                        await this.tagsRepository.insertTagsByCategoryId([tagName], category.id);
                        return await this.tagsRepository.getTagByName(tagName);
                    }
                    throw error;
                }
            })
        );

        await this.repository.insertTagsToProduct(tagObjects, productId);
    }
}

export const productTagsService: IProductsTagsService = new ProductsTagsService(productTagsRepository, productRepository, tagsRepository, openAIService,categoryRepository)