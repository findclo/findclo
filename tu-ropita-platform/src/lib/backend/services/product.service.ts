import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductService} from "@/lib/backend/services/interfaces/product.service.interface";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {productRepository} from "@/lib/backend/persistance/products.repository";
import {IProductCSVUploadParser} from "@/lib/backend/parsers/interfaces/productCSVUpload.parser.interface";
import {ProductCSVUploadParser} from "@/lib/backend/parsers/productCSVUpload.parser";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";
import {
    IListProductsParams,
} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";
import {ITagsService} from "@/lib/backend/services/interfaces/tags.service.interface";
import {tagsService} from "@/lib/backend/services/tags.service";
import {ITag} from "@/lib/backend/models/interfaces/tag.interface";
import {IListProductResponseDto} from "@/lib/backend/dtos/listProductResponse.dto.interface";
import {IAIService} from "@/lib/backend/services/interfaces/AI.service.interface";
import {openAIService} from "@/lib/backend/services/openAI.service";

class ProductService implements IProductService{
    private repository: IProductRepository;
    private parser: IProductCSVUploadParser;
    private tagService : ITagsService;
    private aiService : IAIService;

    constructor(repository: IProductRepository, parser: IProductCSVUploadParser, tagsService : ITagsService, aiService : IAIService) {
        this.repository = repository;
        this.parser = parser;
        this.tagService = tagsService;
        this.aiService = aiService;
    }


    public async listProducts(params: IListProductsParams): Promise<IListProductResponseDto>{

        let tags : ITag[] = [];
        if(params.tagsIds){
            tags = await this.tagService.getTagsByIds(params.tagsIds);
        }

        if (params.search) {
            const aiResponse: IAITagsResponse = await this.aiService.runAssistant(params.search);
            const tagNames = Object.values(aiResponse).flat();
            if (tagNames.length > 0) {
                tags = tags.concat( await this.tagService.getTagsByName(tagNames))
            }
        }

        const products : IProduct[] = await this.repository.listProducts(params,tags);

        return {
            appliedTags: tags,
            availableTags: await this.tagService.getAvailableTagsForProducts(products.map(p=>p.id),tags),
            pageNum: 1,
            pageSize: products.length,
            products: await this.repository.listProducts(params,tags),
            totalPages: 1
        };

    }

    public async uploadProductsFromCSV(file : File){
        const products : IProductDTO[] = await this.parser.parse(file);

        const dbRes = await this.repository.bulkProductInsert(products,1);

        console.log(`db insert result ${dbRes}`);
    }
}

export const productService : ProductService = new ProductService(productRepository, new ProductCSVUploadParser(), tagsService, openAIService);