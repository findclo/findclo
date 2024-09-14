import { ICategory } from "@/lib/backend/models/interfaces/category.interface";
import { categoryRepository } from "@/lib/backend/persistance/category.repository";

export interface ICategoryService {
    getCategoryByName(categoryName: string): Promise<ICategory>;
    getCategoryById(categoryId: string): Promise<ICategory>;
    listAllCategories(): Promise<ICategory[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class CategoryService implements ICategoryService{

    async getCategoryByName(categoryName: string): Promise<ICategory> {
        return await categoryRepository.getCategoryByName(categoryName);
    }

    async getCategoryById(categoryId: string): Promise<ICategory> {
        return await categoryRepository.getCategoryById(categoryId);
    }

    async listAllCategories(): Promise<ICategory[]> {
        return await categoryRepository.listCategories();
    }

}

export const categoryService : ICategoryService = new CategoryService();
