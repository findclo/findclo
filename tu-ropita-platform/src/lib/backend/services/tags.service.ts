import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { tagsRepository } from "@/lib/backend/persistance/tags.repository";

export interface ITagsService {
    getTagsByName(names: string[]): Promise<ITag[]>;
    getAvailableTagsForProducts(productsId: string[], excludeTags: ITag[] | undefined): Promise<ITag[]>;
    getTagsByIds(names: string[]): Promise<ITag[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class TagsService implements ITagsService {

    getTagsByName(names: string[]): Promise<ITag[]> {
        return tagsRepository.getTagsByName(names);
    }

    getTagsByIds(ids: string[]): Promise<ITag[]> {
        return tagsRepository.getTagsByIds(ids);
    }

    async getAvailableTagsForProducts(productsId: string[], excludeTags: ITag[] | undefined): Promise<ITag[]>{

        if(productsId.length > 0) {
            return tagsRepository.getAvailableTagsForProducts(productsId, excludeTags);
        }
        return [];
    }

}

export const tagsService : ITagsService = new TagsService();