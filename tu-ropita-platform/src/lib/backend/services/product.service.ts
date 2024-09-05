import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductService} from "@/lib/backend/services/interfaces/product.service.interface";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {productRepository} from "@/lib/backend/persistance/products.repository";

class ProductService implements IProductService{
    private repository: IProductRepository;

    constructor(repository: IProductRepository) {
        this.repository = repository;
    }


    public async listProducts(): Promise<IProduct[]>{
        return this.repository.listProducts(undefined);
    }
}

export const productService : ProductService = new ProductService(productRepository);