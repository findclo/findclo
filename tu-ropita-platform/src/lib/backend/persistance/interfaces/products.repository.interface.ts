import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export interface IProductRepository {
    listProducts(params: any) : Promise<IProduct[]>;
};