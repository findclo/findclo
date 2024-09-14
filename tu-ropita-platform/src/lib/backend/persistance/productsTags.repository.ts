import pool from "@/lib/backend/conf/db.connections";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { Pool } from "pg";
import { undefined } from "zod";

export interface IProductsTagsRepository {
    insertTagsToProduct(tags: ITag[], productId : string) : Promise<void>;

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class ProductsTagsRepository implements IProductsTagsRepository {
    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async insertTagsToProduct(tags: ITag[], productId: string): Promise<void> {
        const values: any[] = [];
        const valuePlaceholders: string[] = [];
        tags.forEach((tag:ITag)=>{
            // @ts-ignore
            if (tag.id === undefined){
                throw new Error("Invalid tag ");
            }
        })
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
            const res = await this.db.query(query, values);
            console.log('ProductsTags inserted successfully');
        } catch (error:any) {
            // CODE 23505 is repeteaded
            if(error.code == '23505'){
                return ;
            }
            console.error('Error inserting productsTags:', error);
            throw error;
        }
    }


}

export const productTagsRepository : IProductsTagsRepository = new ProductsTagsRepository(pool);