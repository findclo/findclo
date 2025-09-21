import {
    ICategoryTreeResponseDTO,
    ICategoryCreateDTO,
    ICategoryUpdateDTO,
    IProductsCategoryAssignmentDTO,
} from "@/lib/backend/dtos/category.dto.interface";
import { ICategory, ICategoryBreadcrumb } from "@/lib/backend/models/interfaces/category.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

const CATEGORIES_PATH = `/categories`;

class PublicCategoriesApiWrapper {

    async getCategoryTree(): Promise<ICategoryTreeResponseDTO> {
        const [error, categoryTree] = await fetcher(`${CATEGORIES_PATH}?format=tree`);
        if (error) {
            console.error(`Error fetching category tree: ${error}`);
            throw new Error(`Error fetching category tree: ${error}`);
        }
        return categoryTree as ICategoryTreeResponseDTO;
    }

    async getAllCategories(): Promise<ICategory[] | null> {
        const [error, categories] = await fetcher(`${CATEGORIES_PATH}?format=list`);
        if (error) {
            console.error(`Error fetching categories: ${error}`);
            return null;
        }
        return categories as ICategory[];
    }

    async getCategoryById(categoryId: number): Promise<(ICategory & { breadcrumb: ICategoryBreadcrumb[] }) | null> {
        const [error, category] = await fetcher(`${CATEGORIES_PATH}/${categoryId}`);
        if (error) {
            console.error(`Error fetching category ${categoryId}: ${error}`);
            return null;
        }
        return category as ICategory & { breadcrumb: ICategoryBreadcrumb[] };
    }

}

class PrivateCategoriesApiWrapper {

    async createCategory(auth_token: string, categoryData: ICategoryCreateDTO): Promise<ICategory | null> {
        const [error, createdCategory] = await fetcher(`${CATEGORIES_PATH}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryData)
        });

        if (error) {
            console.error(`Error creating category: ${error}`);
            return null;
        }

        return createdCategory as ICategory;
    }

    async updateCategory(auth_token: string, categoryId: number, updateData: ICategoryUpdateDTO): Promise<ICategory | null> {
        const [error, updatedCategory] = await fetcher(`${CATEGORIES_PATH}/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (error) {
            console.error(`Error updating category ${categoryId}: ${error}`);
            return null;
        }

        return updatedCategory as ICategory;
    }

    async deleteCategory(auth_token: string, categoryId: number): Promise<{ message: string }> {
        const [error, response] = await fetcher(`${CATEGORIES_PATH}/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (error) {
            console.error(`Error deleting category ${categoryId}: ${error}`);
            return { message: `Error deleting category ${categoryId}: ${error}` };
        }

        return response as { message: string };
    }

    async assignCategoryToProducts(auth_token: string, brandId: string, productIds: number[], categoryId: number): Promise<boolean> {
        const [error] = await fetcher(`/brands/${brandId}/products/categories`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productIds, categoryId } as IProductsCategoryAssignmentDTO)
        });

        if (error) {
            console.error(`Error assigning category to products: ${error}`);
            return false;
        }

        return true;
    }
}

export const publicCategoriesApiWrapper = new PublicCategoriesApiWrapper();
export const privateCategoriesApiWrapper = new PrivateCategoriesApiWrapper();