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

class ProductService implements IProductService{
    private repository: IProductRepository;
    private parser: IProductCSVUploadParser;

    constructor(repository: IProductRepository, parser: IProductCSVUploadParser) {
        this.repository = repository;
        this.parser = parser;
    }


    public async listProducts(params: IListProductsParams): Promise<IProduct[]>{
        return this.repository.listProducts(params);
    }

    public async uploadProductsFromCSV(file : File){
        const products : IProductDTO[] = await this.parser.parse(file);

        const dbRes = await this.repository.bulkProductInsert(products,1);

        console.log(`db insert result ${dbRes}`);
    }
}

export const productService : ProductService = new ProductService(productRepository, new ProductCSVUploadParser());