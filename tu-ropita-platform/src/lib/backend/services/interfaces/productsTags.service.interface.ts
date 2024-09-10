import {ITag} from "@/lib/backend/models/interfaces/tag.interface";

export interface IProductsTagsService {
    tagPendingProducts(): Promise<void>;
    tagProduct(tags: ITag[], product_id: number): Promise<void>;
}