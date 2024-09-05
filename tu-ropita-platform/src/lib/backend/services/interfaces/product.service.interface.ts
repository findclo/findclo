import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export interface IProductService{
    listProducts(): IProduct[];
}