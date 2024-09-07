import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IListProductsParams} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";

export interface IProductService{
    listProducts(params: IListProductsParams): Promise<IProduct[]>;
}