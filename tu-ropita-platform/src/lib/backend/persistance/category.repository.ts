import pool from "@/lib/backend/conf/db.connections";
import { CategoryNotFoundException } from "@/lib/backend/exceptions/categoryNotFoundException";
import { ICategory, ICategoryTree, ICategoryBreadcrumb, ICategoryWithProducts } from "@/lib/backend/models/interfaces/category.interface";
import { ICategoryCreateDTO, ICategoryUpdateDTO } from "@/lib/backend/dtos/category.dto.interface";
import { Pool } from "pg";


class CategoryRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    async getCategoryByName(categoryName: string): Promise<ICategory> {
        const query = `SELECT id, name, slug, parent_id, sort_order, level, description,
                       created_at, updated_at FROM Category WHERE name = $1`;
        const categories = await this.queryCategory(query, [categoryName]);
        if (categories && categories.length > 0) {
            return categories[0];
        }
        throw new CategoryNotFoundException(categoryName);
    }

    async getCategoryById(categoryId: number): Promise<ICategory> {
        const query = `SELECT id, name, slug, parent_id, sort_order, level, description,
                       created_at, updated_at FROM Category WHERE id = $1`;
        const categories = await this.queryCategory(query, [categoryId]);
        if (categories && categories.length > 0) {
            return categories[0];
        }
        throw new CategoryNotFoundException(categoryId.toString());
    }

    async getCategoryBySlug(slug: string): Promise<ICategory> {
        const query = `SELECT id, name, slug, parent_id, sort_order, level, description,
                       created_at, updated_at FROM Category WHERE slug = $1`;
        const categories = await this.queryCategory(query, [slug]);
        if (categories && categories.length > 0) {
            return categories[0];
        }
        throw new CategoryNotFoundException(slug);
    }

    async listCategories(): Promise<ICategory[]> {
        const query = `SELECT id, name, slug, parent_id, sort_order, level, description,
                       created_at, updated_at FROM Category
                       ORDER BY level, sort_order, name`;
        return await this.queryCategory(query, []);
    }

    async getCategoryTree(): Promise<ICategoryTree[]> {
        const query = `SELECT id, name, slug, parent_id, sort_order, level, description,
                       created_at, updated_at FROM Category
                       ORDER BY level, sort_order, name`;
        const allCategories = await this.queryCategory(query, []);
        return this.buildTree(allCategories);
    }

    async getDescendantIds(categoryId: number): Promise<number[]> {
        const query = `
            WITH RECURSIVE category_descendants AS (
                SELECT id FROM Category WHERE id = $1
                UNION ALL
                SELECT c.id FROM Category c
                INNER JOIN category_descendants cd ON c.parent_id = cd.id
            )
            SELECT id FROM category_descendants ORDER BY id
        `;

        try {
            const result = await this.db.query(query, [categoryId]);
            return result.rows.map(row => row.id);
        } catch (error) {
            console.error('Error getting descendant IDs:', error);
            throw new Error('Failed to retrieve descendant categories.');
        }
    }

    async getCategoryWithProducts(categoryId: number): Promise<ICategoryWithProducts> {
        const category = await this.getCategoryById(categoryId);
        const breadcrumb = await this.getCategoryBreadcrumb(categoryId);
        const descendantIds = await this.getDescendantIds(categoryId);

        const countQuery = `
            SELECT COUNT(DISTINCT p.id) as product_count
            FROM Products p
            INNER JOIN product_categories pc ON p.id = pc.product_id
            WHERE pc.category_id = ANY($1)
        `;

        try {
            const result = await this.db.query(countQuery, [descendantIds]);
            const productCount = parseInt(result.rows[0].product_count) || 0;

            return {
                ...category,
                breadcrumb,
                product_count: productCount
            };
        } catch (error) {
            console.error('Error getting category with products:', error);
            throw new Error('Failed to retrieve category with products.');
        }
    }

    async getCategoryBreadcrumb(categoryId: number): Promise<ICategoryBreadcrumb[]> {
        const query = `
            WITH RECURSIVE category_path AS (
                SELECT id, name, slug, parent_id, 0 as depth FROM Category WHERE id = $1
                UNION ALL
                SELECT c.id, c.name, c.slug, c.parent_id, cp.depth + 1
                FROM Category c
                INNER JOIN category_path cp ON c.id = cp.parent_id
            )
            SELECT id, name, slug FROM category_path ORDER BY depth DESC
        `;

        try {
            const result = await this.db.query(query, [categoryId]);
            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                slug: row.slug
            }));
        } catch (error) {
            console.error('Error getting category breadcrumb:', error);
            throw new Error('Failed to retrieve category breadcrumb.');
        }
    }

    async createCategory(categoryData: ICategoryCreateDTO): Promise<ICategory> {
        let level = 0;
        if (categoryData.parent_id) {
            const parent = await this.getCategoryById(categoryData.parent_id);
            level = parent.level + 1;
        }

        const query = `
            INSERT INTO Category (name, slug, parent_id, sort_order, level, description)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, name, slug, parent_id, sort_order, level, description, created_at, updated_at
        `;

        const values = [
            categoryData.name,
            categoryData.slug,
            categoryData.parent_id || null,
            categoryData.sort_order || 0,
            level,
            categoryData.description || null,
        ];

        try {
            const result = await this.db.query(query, values);
            return this.mapCategoryRow(result.rows[0]);
        } catch (error) {
            console.error('Error creating category:', error);
            throw new Error('Failed to create category.');
        }
    }

    async updateCategory(categoryId: number, categoryData: ICategoryUpdateDTO): Promise<ICategory> {
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (categoryData.name !== undefined) {
            updateFields.push(`name = $${paramIndex++}`);
            values.push(categoryData.name);
        }
        if (categoryData.slug !== undefined) {
            updateFields.push(`slug = $${paramIndex++}`);
            values.push(categoryData.slug);
        }
        if (categoryData.description !== undefined) {
            updateFields.push(`description = $${paramIndex++}`);
            values.push(categoryData.description);
        }
        if (categoryData.sort_order !== undefined) {
            updateFields.push(`sort_order = $${paramIndex++}`);
            values.push(categoryData.sort_order);
        }

        if (updateFields.length === 0) {
            return await this.getCategoryById(categoryId);
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(categoryId);

        const query = `
            UPDATE Category SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING id, name, slug, parent_id, sort_order, level, description, created_at, updated_at
        `;

        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) {
                throw new CategoryNotFoundException(categoryId.toString());
            }
            return this.mapCategoryRow(result.rows[0]);
        } catch (error) {
            console.error('Error updating category:', error);
            throw new Error('Failed to update category.');
        }
    }

    async deleteCategory(categoryId: number): Promise<boolean> {
        const query = 'DELETE FROM Category WHERE id = $1';
        try {
            const result = await this.db.query(query, [categoryId]);
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting category:', error);
            throw new Error('Failed to delete category.');
        }
    }

    async assignProductToCategories(productId: number, categoryIds: number[]): Promise<void> {
        if (categoryIds.length === 0) return;

        const values = categoryIds.map((_, index) => `($1, $${index + 2})`).join(', ');
        const query = `
            INSERT INTO product_categories (product_id, category_id)
            VALUES ${values}
            ON CONFLICT (product_id, category_id) DO NOTHING
        `;

        try {
            await this.db.query(query, [productId, ...categoryIds]);
        } catch (error) {
            console.error('Error assigning product to categories:', error);
            throw new Error('Failed to assign product to categories.');
        }
    }

    async assignCategoryToMultipleProducts(productIds: number[], categoryId: number): Promise<void> {
        if (productIds.length === 0) return;

        const values = productIds.map((_, index) => `($${index + 1}, $${productIds.length + 1})`).join(', ');
        const query = `
            INSERT INTO product_categories (product_id, category_id)
            VALUES ${values}
            ON CONFLICT (product_id, category_id) DO NOTHING
        `;

        try {
            await this.db.query(query, [...productIds, categoryId]);
        } catch (error) {
            console.error('Error assigning category to multiple products:', error);
            throw new Error('Failed to assign category to multiple products.');
        }
    }

    async removeProductFromCategories(productId: number, categoryIds?: number[]): Promise<void> {
        let query = 'DELETE FROM product_categories WHERE product_id = $1';
        let values: any[] = [productId];

        if (categoryIds && categoryIds.length > 0) {
            query += ' AND category_id = ANY($2)';
            values.push(categoryIds);
        }

        try {
            await this.db.query(query, values);
        } catch (error) {
            console.error('Error removing product from categories:', error);
            throw new Error('Failed to remove product from categories.');
        }
    }

    async getProductCategories(productId: number): Promise<ICategory[]> {
        const query = `
            SELECT c.id, c.name, c.slug, c.parent_id, c.sort_order, c.level, c.description,
                   c.created_at, c.updated_at
            FROM Category c
            INNER JOIN product_categories pc ON c.id = pc.category_id
            WHERE pc.product_id = $1
            ORDER BY c.level, c.sort_order, c.name
        `;

        return await this.queryCategory(query, [productId]);
    }

    async updateCategoryHierarchy(categoryId: number, newParentId: number | null): Promise<void> {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            let newLevel = 0;
            if (newParentId) {
                const parent = await this.getCategoryById(newParentId);
                newLevel = parent.level + 1;

                const descendants = await this.getDescendantIds(categoryId);
                if (descendants.includes(newParentId)) {
                    throw new Error('Cannot move category to its own descendant');
                }
            }

            await client.query(
                'UPDATE Category SET parent_id = $1, level = $2 WHERE id = $3',
                [newParentId, newLevel, categoryId]
            );

            const updateDescendantsQuery = `
                WITH RECURSIVE category_update AS (
                    SELECT id, parent_id, $2 as new_level FROM Category WHERE id = $1
                    UNION ALL
                    SELECT c.id, c.parent_id, cu.new_level + 1
                    FROM Category c
                    INNER JOIN category_update cu ON c.parent_id = cu.id
                )
                UPDATE Category SET level = cu.new_level
                FROM category_update cu
                WHERE Category.id = cu.id AND Category.id != $1
            `;

            await client.query(updateDescendantsQuery, [categoryId, newLevel]);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating category hierarchy:', error);
            throw new Error('Failed to update category hierarchy.');
        } finally {
            client.release();
        }
    }

    private buildTree(categories: ICategory[]): ICategoryTree[] {
        const categoryMap = new Map<number, ICategoryTree>();
        const rootCategories: ICategoryTree[] = [];

        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] });
        });

        categories.forEach(category => {
            const categoryNode = categoryMap.get(category.id)!;
            if (category.parent_id === null) {
                rootCategories.push(categoryNode);
            } else {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    parent.children.push(categoryNode);
                }
            }
        });

        return rootCategories;
    }

    private mapCategoryRow(row: any): ICategory {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            parent_id: row.parent_id,
            sort_order: row.sort_order,
            level: row.level,
            description: row.description,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    private async queryCategory(query: string, values: any[]): Promise<ICategory[]> {
        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) return [];

            return result.rows.map(row => this.mapCategoryRow(row));
        } catch (error) {
            console.error(`Error executing query: ${query}`, error);
            throw new Error('Failed to retrieve category data.');
        }
    }
}

export const categoryRepository: CategoryRepository = new CategoryRepository(pool);
