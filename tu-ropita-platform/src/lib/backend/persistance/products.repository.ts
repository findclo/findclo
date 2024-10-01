import pool from "@/lib/backend/conf/db.connections";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import {Pool, QueryResult} from "pg";
import {ProductNotFoundException} from "@/lib/backend/exceptions/productNotFound.exception";
import {BrandNotFoundException} from "@/lib/backend/exceptions/brandNotFound.exception";

export interface  IListProductsParams {
    search?:string;
    brandId?:number;
    tagged?: boolean;
    tagsIds?: string[];
    productId?: number;
}
// TODO ADD (brand, tags, etc.)

export interface IProductRepository {
    getProductById(productId: number): Promise<IProduct | null>;
    listProducts(params: IListProductsParams, tags?: ITag[]) : Promise<IProduct[]>;
    bulkProductInsert(products : IProductDTO[], brandId: number): Promise<number>;
    markProductAsTagged(productId: number): Promise<void>;
    deleteProduct(productId: number): Promise<boolean>;
    updateProduct(productId: number, updateProduct: IProductDTO): Promise<IProduct>;
    markProductAsUntagged(productId: number): Promise<void>;
    updateProductStatus(id: number, status: string): Promise<IProduct>;
};


class ProductsRepository implements IProductRepository{
    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    public async getProductById(productId: number): Promise<IProduct | null> {
        const query = `SELECT * FROM Products WHERE id = $1`;
        const values = [productId];

        try {
            const res = await this.db.query(query, values);
            if(res.rowCount == null || res.rowCount <= 0){
                return null;
            }
            return this.mapProductRows(res.rows)[0];
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    public async listProducts(params: IListProductsParams, tags?: ITag[]) : Promise<IProduct[]>{
        const {query, values} = this.constructListQuery(params,tags);
        try {
            const res = await this.db.query(query, values);
            return this.mapProductRows(res.rows);
        } catch (err) {
            console.error('Error executing query:', err);
            throw err;
        }
    }

    public async bulkProductInsert(products : IProductDTO[], brandId: number): Promise<number>{

        const valuePlaceholders = products.map((_, index) => {
            const offset = index * 7;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 
            to_tsvector('spanish', coalesce($${offset + 6}, '') || ' ' || coalesce($${offset + 7}, ''))
        )`;
        });

        const values = products.flatMap(product => [
            product.name,
            product.price,
            product.description,
            product.images,
            brandId,
            product.name,
            product.description
        ]);

        const query = `
            INSERT INTO Products (name, price, description, images, brand_id, tsv)
            VALUES ${valuePlaceholders.join(', ')}
        `;


        try {
            const res = await pool.query(query, values);
            console.log('Products inserted successfully');
            return res.rowCount == null? 0:res.rowCount;
        } catch (error) {
            console.error('Error inserting products:', error);
            return -1;
        }
    }

    async markProductAsTagged(productId: number): Promise<void> {
        this.markProductIsTagged(productId,true);
    }

    async markProductAsUntagged(productId: number): Promise<void> {
        this.markProductIsTagged(productId,false);
    }


    private async markProductIsTagged(productId: number, isTagged: boolean): Promise<void> {
        const query: string = `UPDATE Products
            SET has_tags_generated = $1
            WHERE id = $2;`;

        try {
            const result = await pool.query(query, [isTagged,productId]);

            if (result.rowCount === 0) {
                // TODO HANDLE THIS
                throw new ProductNotFoundException(productId);
            }

            console.log(`Product with ID ${productId} has been marked as tagged.`);
        } catch (error) {
            console.error(`Error marking product as tagged: ${(error as any).message}`);
            throw error;
        }
    }

    async deleteProduct(id: number): Promise<boolean> {
        const query = `DELETE FROM Products WHERE id = $1`;
        const values = [id];

        try {
            const res = await this.db.query(query, values);
            return res.rowCount!= null? res.rowCount > 0: false;
        } catch (error: any) {
            console.log(error); // No need to raise error.
            return false;
        }
    }


    async updateProduct(id: number, product: IProductDTO): Promise<IProduct> {
        const query = `
            UPDATE Products
            SET name = $1::TEXT, 
                price = $2, 
                description = $3, 
                images = $4,
                has_tags_generated = false,
                tsv = to_tsvector('spanish', coalesce($1, '') || ' ' || coalesce($3, ''))
            WHERE id = $5
            RETURNING *
        `;

        const values = [product.name, product.price, product.description, product.images, id];
        return this.executeUpdate(query, values);
    }

    async updateProductStatus(id: number, status: string): Promise<IProduct> {
        const query = `
            UPDATE Products
            SET status = $1
            WHERE id = $2
            RETURNING *
        `;

        const values = [status, id];
        return this.executeUpdate(query, values);
    }

    private async executeUpdate(query: string, values: any[]): Promise<IProduct> {
        try {
            const res: QueryResult = await this.db.query(query, values);
            if (res.rowCount === 0) {
                throw new ProductNotFoundException(values[values.length - 1]);
            }
            return this.mapProductRows(res.rows)[0];
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }


    private mapProductRows(rows: any[]): IProduct[] {
        if(rows.length == 0){
            return [];
        }
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price),
            description: row.description,
            images: row.images,
            status: row.status,
            brand: {
                id: row.brandId,
                name: '',
                image: '',
                websiteUrl: ''
            }
        }));
    }

    private constructListQuery(params: IListProductsParams, tags?: ITag[]): { query: string, values: any[] } {
        let query = `SELECT DISTINCT p.* FROM products p`;
        const conditions: string[] = [];
        const values: any[] = [];

        if (tags && tags.length > 0) {
            query += ` JOIN Product_Tags pt ON p.id = pt.product_id
                       JOIN Tags t ON pt.tag_id = t.id`;
            const tagNames = tags.map(tag => tag.name);
            const tagPlaceholders = tagNames.map((_, idx) => `$${values.length + idx + 1}`);
            conditions.push(`t.name IN (${tagPlaceholders.join(', ')})`);
            values.push(...tagNames);
        }

        // if (params.search && params.search.trim().length > 1) {
        //     console.log(params.search)
        //     const sanitizedSearch = params.search
        //         .trim()
        //         .replace(/[^a-zA-Z0-9\s]/g, '')
        //         .split(/\s+/)
        //         .map(word => word + ':*')
        //         .join(' & ');
        //     conditions.push(`tsv @@ to_tsquery('spanish', $${values.length + 1})`);
        //
        //     values.push(sanitizedSearch);
        // }

        if (params.brandId) {
            conditions.push(`p.brand_id = $${values.length + 1}`);
            values.push(params.brandId);
        }

        if(params.tagged){
            conditions.push(`p.has_tags_generated = $${values.length + 1}`);
            values.push(params.tagged);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` GROUP BY p.id;`;

        return { query, values };
    }

}


export const productRepository = new ProductsRepository(pool);