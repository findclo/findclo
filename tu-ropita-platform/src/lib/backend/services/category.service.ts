import { ICategory, ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { ICategoryCreateDTO, ICategoryUpdateDTO, ICategoryTreeResponseDTO } from "@/lib/backend/dtos/category.dto.interface";
import { categoryRepository } from "@/lib/backend/persistance/category.repository";


export class CategoryService {

    async listAllCategories(): Promise<ICategory[]> {
        return await categoryRepository.listCategories();
    }

    async getCategoryTree(): Promise<ICategoryTreeResponseDTO> {
        const tree = await categoryRepository.getCategoryTree();
        return {
            categories: tree,
            total_count: this.countCategoriesInTree(tree)
        };
    }

    async getDescendantIds(categoryId: number): Promise<number[]> {
        return await categoryRepository.getDescendantIds(categoryId);
    }

    async createCategory(categoryData: ICategoryCreateDTO): Promise<ICategory> {
        categoryData.slug = this.generateSlug(categoryData.name);

        if (categoryData.parent_id) {
            const isValid = await this.validateCategoryHierarchy(0, categoryData.parent_id);
            if (!isValid) {
                throw new Error('Invalid parent category for hierarchy');
            }
        }

        return await categoryRepository.createCategory(categoryData);
    }

    async updateCategory(categoryId: number, categoryData: ICategoryUpdateDTO): Promise<ICategory> {
        if (categoryData.name ) {
            categoryData.slug = this.generateSlug(categoryData.name);
        }

        if (categoryData.parent_id !== undefined) {
            const isValid = await this.validateCategoryHierarchy(categoryId, categoryData.parent_id);
            if (!isValid) {
                throw new Error('Invalid parent category for hierarchy');
            }
        }

        return await categoryRepository.updateCategory(categoryId, categoryData);
    }

    async deleteCategory(categoryId: number): Promise<boolean> {
        return await categoryRepository.deleteCategory(categoryId);
    }

    async assignProductToCategories(productId: number, categoryIds: number[]): Promise<void> {
        for (const categoryId of categoryIds) {
            await categoryRepository.getCategoryById(categoryId);
        }
        await categoryRepository.assignProductToCategories(productId, categoryIds);
    }

    async removeProductFromCategories(productId: number, categoryIds?: number[]): Promise<void> {
        await categoryRepository.removeProductFromCategories(productId, categoryIds);
    }

    async updateCategoryHierarchy(categoryId: number, newParentId: number | null): Promise<void> {
        const isValid = await this.validateCategoryHierarchy(categoryId, newParentId);
        if (!isValid) {
            throw new Error('Invalid hierarchy: would create circular reference');
        }

        await categoryRepository.updateCategoryHierarchy(categoryId, newParentId);
    }

    async validateCategoryHierarchy(categoryId: number, newParentId: number | null): Promise<boolean> {
        if (!newParentId) return true;
        if (categoryId === newParentId) return false;

        if (categoryId > 0) {
            const descendants = await this.getDescendantIds(categoryId);
            return !descendants.includes(newParentId);
        }

        return true;
    }

    private generateSlug(name: string): string {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    private countCategoriesInTree(tree: ICategoryTree[]): number {
        let count = 0;
        const countRecursive = (categories: ICategoryTree[]) => {
            for (const category of categories) {
                count++;
                if (category.children.length > 0) {
                    countRecursive(category.children);
                }
            }
        };
        countRecursive(tree);
        return count;
    }
}

export const categoryService: CategoryService = new CategoryService();
