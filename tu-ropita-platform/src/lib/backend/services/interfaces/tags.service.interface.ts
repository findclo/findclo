import {ITag} from "@/lib/backend/models/interfaces/tag.interface";

export interface ITagsService {
    getTagsByName(names: string[]): Promise<ITag[]>;
    getAvailableTagsForProducts(productsId: string[], excludeTags: ITag[] | undefined): Promise<ITag[]>;
}