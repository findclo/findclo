import {IListProductsParams} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";
import {IListProductResponseDto} from "@/lib/backend/dtos/listProductResponse.dto.interface";

export interface IProductService{
    listProducts(params: IListProductsParams): Promise<IListProductResponseDto>;
}