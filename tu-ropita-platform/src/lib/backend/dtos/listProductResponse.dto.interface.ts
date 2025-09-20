import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export interface IListProductResponseDto {
    products : IProduct[];
    pageNum: number;
    totalPages: number;
    pageSize: number;
}