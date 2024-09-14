import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { IListProductsParams } from "@/lib/backend/persistance/interfaces/listProductsParams.interface";

export interface IProductRepository {
    getProductById(productId: number): Promise<IProduct | null>;
    listProducts(params: IListProductsParams, tags?: ITag[]) : Promise<IProduct[]>;
    bulkProductInsert(products : IProductDTO[], brandId: number): Promise<number>;
    markProductAsTagged(productId: string): Promise<void>;
};