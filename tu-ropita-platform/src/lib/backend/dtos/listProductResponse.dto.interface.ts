import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {ITag} from "@/lib/backend/models/interfaces/tag.interface";

export interface IListProductResponseDto {
    products : IProduct[];
    appliedTags : ITag[] | undefined;
    availableTags : ITag[];
    pageNum: number;
    totalPages: number;
    pageSize: number;
}