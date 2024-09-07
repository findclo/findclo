import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";
import {IListProductsParams} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";

export interface IProductRepository {
    listProducts(params: IListProductsParams) : Promise<IProduct[]>;
    bulkProductInsert(products : IProductDTO[], brandId: number): Promise<number>;
};