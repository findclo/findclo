import {IProductsTagsService} from "@/lib/backend/services/interfaces/productsTags.service.interface";
import {ITag} from "@/lib/backend/models/interfaces/tag.interface";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {IProductsTagsRepository} from "@/lib/backend/persistance/interfaces/productsTags.repository.interface";
import {IAIService} from "@/lib/backend/services/interfaces/AI.service.interface";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {productTagsRepository} from "@/lib/backend/persistance/productsTags.repository";
import {productRepository} from "@/lib/backend/persistance/products.repository";
import {openAIService} from "@/lib/backend/services/openAI.service";

class ProductsTagsService implements IProductsTagsService {
    private repository: IProductsTagsRepository;
    private productsRepository: IProductRepository;
    private aiService : IAIService;

    constructor(repository: IProductsTagsRepository, productsRepository: IProductRepository, aiService : IAIService) {
        this.repository = repository;
        this.productsRepository = productsRepository;
        this.aiService = aiService;
    }


    async tagPendingProducts(): Promise<void> {
        const pendingProductsToTag : IProduct[] = await this.productsRepository.listProducts({tagged: false});

        for (const prod of pendingProductsToTag) {
            if(prod.description) {
                // TODO Agregar nombre, marca etc al prompt
                const aiResponse = await this.aiService.runAssistant(prod.description);

                if (aiResponse) {
                    this.productsRepository.markProductAsTagged(prod.id);

                    // TODO Extract tags and store them in db
                    console.log(aiResponse)
                }
            }
        }

    }

    async tagProduct(tags: ITag[], product_id: number): Promise<void> {
    }
}

export const productTagsService: IProductsTagsService = new ProductsTagsService(productTagsRepository, productRepository, openAIService)