import {ITag} from "@/lib/backend/models/interfaces/tag.interface";

export interface ITagRepository {
    insertTagsByCategoryId(tags : ITag[], categoryId : number): Promise<void>;
    getTagsByCategoryId(categoryId: number): Promise<ITag[]>;
}