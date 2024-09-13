import {ITagsService} from "@/lib/backend/services/interfaces/tags.service.interface";
import {ITag} from "@/lib/backend/models/interfaces/tag.interface";
import {ITagRepository} from "@/lib/backend/persistance/interfaces/tags.repository.interface";
import {tagsRepository} from "@/lib/backend/persistance/tags.repository";

class TagsService implements ITagsService {
    private repository : ITagRepository;

    constructor(repository: ITagRepository) {
        this.repository = repository;
    }

    getTagsByName(names: string[]): Promise<ITag[]> {
        return this.repository.getTagsByName(names);
    }

}

export const tagsService : ITagsService = new TagsService(tagsRepository);