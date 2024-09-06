import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductService} from "@/lib/backend/services/interfaces/product.service.interface";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {productRepository} from "@/lib/backend/persistance/products.repository";
import {IProductCSVUploadParser} from "@/lib/backend/parsers/interfaces/productCSVUpload.parser.interface";
import {ProductCSVUploadParser} from "@/lib/backend/parsers/productCSVUpload.parser";

class ProductService implements IProductService{
    private repository: IProductRepository;
    private parser: IProductCSVUploadParser;

    constructor(repository: IProductRepository, parser: IProductCSVUploadParser) {
        this.repository = repository;
        this.parser = parser;
    }


    public async listProducts(): Promise<IProduct[]>{
        return this.repository.listProducts(undefined);
    }

    public async uploadProductsFromCSV(file : File){
        const products : IProduct[] = await this.parser.parse(file);
        console.log(products);
    }
}

export const productService : ProductService = new ProductService(productRepository, new ProductCSVUploadParser());