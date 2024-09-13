import {ITag} from "@/lib/backend/models/interfaces/tag.interface";

export interface IProductsTagsRepository {
    insertTagsToProduct(tags: ITag[], productId : string) : Promise<void>;

}