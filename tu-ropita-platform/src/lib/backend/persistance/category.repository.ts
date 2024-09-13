import {Pool} from "pg";
import {ICategoryRepository} from "@/lib/backend/persistance/interfaces/category.repository.interface";
import pool from "@/lib/backend/conf/db.connections";
import {ICategory} from "@/lib/backend/models/interfaces/category.interface";

class CategoryRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    async getCategoryByName(categoryName: string): Promise<ICategory | null> {
        const query = 'SELECT id, name FROM Category WHERE name = $1';
        const values = [categoryName];

        try {
            const result = await this.db.query(query, values);
            return result.rows.length ? result.rows[0] : null;
        } catch (error) {
            console.error('Error fetching category by name:', error);
            throw new Error(`Failed to retrieve category for name: ${categoryName}`);
        }
    }
}
export const categoryRepository : ICategoryRepository = new CategoryRepository(pool);