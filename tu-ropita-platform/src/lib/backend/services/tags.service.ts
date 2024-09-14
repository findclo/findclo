import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { ITagRepository } from "@/lib/backend/persistance/interfaces/tags.repository.interface";
import { tagsRepository } from "@/lib/backend/persistance/tags.repository";

export interface ITagsService {
    getTagsByName(names: string[]): Promise<ITag[]>;
    getAvailableTagsForProducts(productsId: string[], excludeTags: ITag[] | undefined): Promise<ITag[]>;
    getTagsByIds(names: string[]): Promise<ITag[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class TagsService implements ITagsService {
    private repository : ITagRepository;

    constructor(repository: ITagRepository) {
        this.repository = repository;
    }

    getTagsByName(names: string[]): Promise<ITag[]> {
        return this.repository.getTagsByName(names);
    }

    getTagsByIds(ids: string[]): Promise<ITag[]> {
        return this.repository.getTagsByIds(ids);
    }

    async getAvailableTagsForProducts(productsId: string[], excludeTags: ITag[] | undefined): Promise<ITag[]>{

        if(productsId.length > 0) {
            return this.repository.getAvailableTagsForProducts(productsId, excludeTags);
        }
        return [];
    }

}

export const tagsService : ITagsService = new TagsService(tagsRepository);