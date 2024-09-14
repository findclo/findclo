import { Pool } from "pg";
import { ICategoryRepository } from "@/lib/backend/persistance/interfaces/category.repository.interface";
import pool from "@/lib/backend/conf/db.connections";
import { ICategory } from "@/lib/backend/models/interfaces/category.interface";
import {CategoryNotFoundException} from "@/lib/backend/exceptions/categoryNotFoundException";

class CategoryRepository implements ICategoryRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    async getCategoryByName(categoryName: string): Promise<ICategory> {
        const query = 'SELECT id, name FROM Category WHERE name = $1';
        const categories = await this.queryCategory(query, [categoryName]);
        if(categories && categories.length > 0){
            return categories[0];
        }
        throw new CategoryNotFoundException(categoryName);
    }

    async getCategoryById(categoryId: string): Promise<ICategory> {
        const query = 'SELECT id, name FROM Category WHERE id = $1';
        const categories = await this.queryCategory(query, [categoryId]);
        if(categories && categories.length > 0){
            return categories[0];
        }
        throw new CategoryNotFoundException(categoryId);
    }

    async listCategories(): Promise<ICategory[]> {
        const query = 'SELECT id, name FROM Category';
        const categories = await this.queryCategory(query, []);
        return categories as ICategory[];
    }

    private async queryCategory(query: string, values: any[]): Promise<ICategory[]> {
        try {
            const result = await this.db.query(query, values);
            if (result.rows.length === 0) return [];

            return result.rows.map(row => ({
                id: row.id,
                name: row.name
            }));
        } catch (error) {
            console.error(`Error executing query: ${query}`, error);
            throw new Error('Failed to retrieve category data.');
        }
    }
}

export const categoryRepository: ICategoryRepository = new CategoryRepository(pool);
