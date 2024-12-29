import {ITag} from "@/lib/backend/models/interfaces/tag.interface";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";

export interface IProductTag {
    product : IProductDTO;
    tags : ITag[]
}