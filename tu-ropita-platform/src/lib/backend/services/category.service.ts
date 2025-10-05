import { ICategory, ICategoryBreadcrumb, ICategoryTree } from "@/lib/backend/models/interfaces/category.interface";
import { ICategoryCreateDTO, ICategoryUpdateDTO, ICategoryTreeResponseDTO } from "@/lib/backend/dtos/category.dto.interface";
import { categoryRepository } from "@/lib/backend/persistance/category.repository";
import { embeddingProcessorService } from "./embeddingProcessor.service";


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

    async getCategoryBreadcrumb(categoryId: number): Promise<ICategoryBreadcrumb[]> {
        return await categoryRepository.getCategoryBreadcrumb(categoryId);
    }

    async getDescendantIds(categoryId: number): Promise<number[]> {
        return await categoryRepository.getDescendantIds(categoryId);
    }

    async createCategory(categoryData: ICategoryCreateDTO): Promise<ICategory> {
        if (categoryData.parent_id) {
            const isValid = await this.validateCategoryHierarchy(0, categoryData.parent_id);
            if (!isValid) {
                throw new Error('Invalid parent category for hierarchy');
            }
        }
        const hierarchicalSlug = await this.generateHierarchicalSlug(categoryData.name, categoryData.parent_id || null);
        return await categoryRepository.createCategory(categoryData, hierarchicalSlug);
    }

    async updateCategory(categoryId: number, categoryData: ICategoryUpdateDTO): Promise<ICategory> {
        if (categoryData.name) {
            const currentCategory = await categoryRepository.getCategoryById(categoryId);
            const parentId = categoryData.parent_id !== undefined ? categoryData.parent_id : currentCategory.parent_id;
            categoryData.slug = await this.generateHierarchicalSlug(categoryData.name, parentId);
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
        await categoryRepository.assignProductToCategories(productId, categoryIds);
        embeddingProcessorService.generateEmbeddingForProduct(productId);
    }

    async removeProductFromCategories(productId: number, categoryIds?: number[]): Promise<void> {
        await categoryRepository.removeProductFromCategories(productId, categoryIds);
        embeddingProcessorService.generateEmbeddingForProduct(productId);

    }

    async assignCategoryToProducts(productIds: number[], categoryId: number): Promise<void> {
        await categoryRepository.assignCategoryToMultipleProducts(productIds, categoryId);
        productIds.forEach(productId => {
            embeddingProcessorService.generateEmbeddingForProduct(productId);
        });
    }

    async updateCategoryHierarchy(categoryId: number, newParentId: number | null): Promise<void> {
        const isValid = await this.validateCategoryHierarchy(categoryId, newParentId);
        if (!isValid) {
            throw new Error('Invalid hierarchy: would create circular reference');
        }

        await categoryRepository.updateCategoryHierarchy(categoryId, newParentId);
        
        // Regenerate slug for the moved category and all its descendants
        await this.regenerateSlugsForCategoryAndDescendants(categoryId);
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

    private async generateHierarchicalSlug(name: string, parentId: number | null): Promise<string> {
        const baseSlug = this.generateSlug(name);
        
        if (!parentId) {
            return baseSlug;
        }

        const breadcrumb = await this.getCategoryBreadcrumb(parentId);
        const parentSlugs = breadcrumb.map(category => category.slug);
        const hierarchicalSlug = [...parentSlugs, baseSlug].join('-');
        
        return  hierarchicalSlug.substring(hierarchicalSlug.length - 250);
    }

    private async regenerateSlugsForCategoryAndDescendants(categoryId: number): Promise<void> {
        const category = await categoryRepository.getCategoryById(categoryId);
        const newSlug = await this.generateHierarchicalSlug(category.name, category.parent_id);
        
        // Update the category's slug
        await categoryRepository.updateCategory(categoryId, { slug: newSlug });
        
        // Get all descendants and regenerate their slugs
        const descendants = await this.getDescendantIds(categoryId);
        for (const descendantId of descendants) {
            const descendant = await categoryRepository.getCategoryById(descendantId);
            const descendantNewSlug = await this.generateHierarchicalSlug(descendant.name, descendant.parent_id);
            await categoryRepository.updateCategory(descendantId, { slug: descendantNewSlug });
        }
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
