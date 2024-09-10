import {IProductsTagsRepository} from "@/lib/backend/persistance/interfaces/productsTags.repository.interface";
import {Pool} from "pg";
import {ITag} from "@/lib/backend/models/interfaces/tag.interface";
import {undefined} from "zod";
import pool from "@/lib/backend/conf/db.connections";

class ProductsTagsRepository implements IProductsTagsRepository {
    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async insertTagsToProduct(tags: ITag[], productId: number): Promise<void> {
        const values: any[] = [];
        const valuePlaceholders: string[] = [];

        tags.forEach((tag, index) => {
            const offset = index * 2;
            valuePlaceholders.push(`($${offset + 1}, $${offset + 2})`);
            values.push(tag.id, productId);
        });

        const query = `
        INSERT INTO Product_Tags (tag_id, product_id)
        VALUES ${valuePlaceholders.join(', ')}
        `;

        try {
            const res = await pool.query(query, values);
            console.log('ProductsTags inserted successfully');
        } catch (error) {
            console.error('Error inserting productsTags:', error);
            throw error;
        }
    }

}

export const productTagsRepository : IProductsTagsRepository = new ProductsTagsRepository(pool);