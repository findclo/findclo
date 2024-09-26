import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { IProductCSVUploadParser, ProductCSVUploadParser } from "@/lib/backend/parsers/productCSVUpload.parser";
import { IListProductsParams, productRepository } from "@/lib/backend/persistance/products.repository";
import { openAIService } from "@/lib/backend/services/openAI.service";
import { tagsService } from "@/lib/backend/services/tags.service";

export interface IProductService {
    listProducts(params: IListProductsParams): Promise<IListProductResponseDto>;
    deleteProduct(id: number): Promise<boolean>;
    uploadProductsFromCSV(file : File): Promise<boolean>;
}


class ProductService implements IProductService{

    private parser: IProductCSVUploadParser = new ProductCSVUploadParser();

    public async listProducts(params: IListProductsParams): Promise<IListProductResponseDto>{
        let tags : ITag[] = [];

        if(params.productId){
            const product = await productRepository.getProductById(params.productId);
            if(!product){
                throw new Error(`Product not found. [productId=${params.productId}]`);
            }
            return {
                appliedTags: [],
                availableTags: [],
                pageNum: 1,
                pageSize: 1,
                products: [product],
                totalPages: 1
            }
        }

        if(params.tagsIds){
            tags = await tagsService.getTagsByIds(params.tagsIds);
        }

        if (params.search) {
            const aiResponse: IAITagsResponse = await openAIService.runAssistant(params.search);
            const tagNames = Object.values(aiResponse).flat();
            if (tagNames.length > 0) {
                tags = tags.concat( await tagsService.getTagsByName(tagNames))
            }
        }

        const products : IProduct[] = await productRepository.listProducts(params,tags);

        return {
            appliedTags: tags,
            availableTags: await tagsService.getAvailableTagsForProducts(products.map(p=>p.id),tags),
            pageNum: 1,
            pageSize: products.length,
            products: await productRepository.listProducts(params,tags),
            totalPages: 1
        };

    }

    public async uploadProductsFromCSV(file : File): Promise<boolean>{
        const products : IProductDTO[] = await this.parser.parse(file);

        const dbRes = await productRepository.bulkProductInsert(products,1);

        console.log(`db insert result ${dbRes}`);
        return dbRes > 0;
    }

    public async deleteProduct(id: number): Promise<boolean> {
        return productRepository.deleteProduct(id);
    }
}

export const productService : ProductService = new ProductService();