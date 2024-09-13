import {ICategory} from "@/lib/backend/models/interfaces/category.interface";

export interface ICategoryRepository{
    getCategoryByName(categoryName: string): Promise<ICategory | null>;
}