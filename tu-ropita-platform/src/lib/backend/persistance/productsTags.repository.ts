import pool from "@/lib/backend/conf/db.connections";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { Pool } from "pg";
import { undefined } from "zod";
import {IProductTag} from "@/lib/backend/models/interfaces/productTag.interface";

export interface IProductsTagsRepository {
    insertTagsToProduct(tags: ITag[], productid : number) : Promise<void>;
    getProductsTagsFromBrand(brandId: number): Promise<IProductTag[]>;

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class ProductsTagsRepository implements IProductsTagsRepository {
    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async insertTagsToProduct(tags: ITag[], productid: number): Promise<void> {
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
            values.push(tag.id, productid);
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

    async getProductsTagsFromBrand(brandId: number): Promise<IProductTag[]> {
        const values = [brandId];
        const query = `SELECT p.id          as productid,
                              p.name        as productName,
                              p.description as productDescription,
                              p.price,
                              p.images,
                              p.url,
                              t.name        as tagName,
                              t.category_id as categoryId,
                              t.id          as tagid
                       FROM product_tags pt
                                JOIN products p ON pt.product_id = p.id
                                JOIN tags t ON t.id = pt.tag_id
                       WHERE p.brand_id = $1; `

        try {
            const res = await this.db.query(query, values);
            return this.mapToProductTags(res.rows);
        } catch (error: any) {
            console.error('Error listing productsTags:', error);
            throw error;
        }
    }

    private mapToProductTags(rows: any[]): IProductTag[] {
        const productTagsMap: { [key: number]: IProductTag } = {};
        rows.forEach(row => {
            console.log(row)
            if (!productTagsMap[row.productid]) {
                productTagsMap[row.productid] = {
                    product: {
                        name: row.productname,
                        description: row.productdescription,
                        price: row.price,
                        images: row.images,
                        url: row.url
                    },
                    tags: []
                };
            }
            productTagsMap[row.productid].tags.push({
                id: row.tagid,
                name: row.tagname,
                category_id: row.category_id
            });
        });
        return Object.values(productTagsMap);
    }

}

export const productTagsRepository : IProductsTagsRepository = new ProductsTagsRepository(pool);