import {ITag} from "@/lib/backend/models/interfaces/tag.interface";

export interface ITagRepository {
    insertTagsByCategoryId(tags : string[], categoryId : number): Promise<void>;
    getTagsByCategoryId(categoryId: number): Promise<ITag[]>;
    getTagByName(tagName: string): Promise<ITag>;
    getTagsByName(tagsName: string[]): Promise<ITag[]>;
    getAvailableTagsForProducts(productsId: string[], excludeTags: ITag[] | undefined): Promise<ITag[]>;
    getTagsByIds(tagIds: string[]): Promise<ITag[]>;
}