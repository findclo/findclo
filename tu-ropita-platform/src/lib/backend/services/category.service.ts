import { ICategoryRepository } from "@/lib/backend/persistance/interfaces/category.repository.interface";
import { ICategory } from "@/lib/backend/models/interfaces/category.interface";
import {categoryRepository} from "@/lib/backend/persistance/category.repository";
import {ICategoryService} from "@/lib/backend/services/interfaces/category.service.interface";

export class CategoryService implements ICategoryService{
    private categoryRepository: ICategoryRepository;

    constructor(categoryRepository: ICategoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async getCategoryByName(categoryName: string): Promise<ICategory> {
        return await this.categoryRepository.getCategoryByName(categoryName);
    }

    async getCategoryById(categoryId: string): Promise<ICategory> {
        return await this.categoryRepository.getCategoryById(categoryId);
    }

    async listAllCategories(): Promise<ICategory[]> {
        return await this.categoryRepository.listCategories();
    }

}

export const categoryService : ICategoryService = new CategoryService(categoryRepository);
