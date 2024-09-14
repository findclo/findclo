import {ICategory} from "@/lib/backend/models/interfaces/category.interface";

export interface ICategoryService {
    getCategoryByName(categoryName: string): Promise<ICategory>;
    getCategoryById(categoryId: string): Promise<ICategory>;
    listAllCategories(): Promise<ICategory[]>;
}