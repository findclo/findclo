import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";

export interface IProductRepository {
    listProducts(params: any) : Promise<IProduct[]>;
    bulkProductInsert(products : IProductDTO[], brandId: number): Promise<number>;
};