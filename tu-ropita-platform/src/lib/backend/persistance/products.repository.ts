import {Pool} from "pg";
import pool from "@/lib/backend/conf/db.connections";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";
import {IListProductsParams} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";

class ProductsRepository implements IProductRepository{
    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    public async listProducts(params: IListProductsParams) : Promise<IProduct[]>{
        const {query, values} = this.constructListQuery(params);
        try {
            const res = await this.db.query(query, values);
            return res.rows.map(row => ({
                id: row.id,
                name: row.name,
                price: parseFloat(row.price),
                description: row.description,
                images: row.images,
                brand: {
                    id: row.brandId,
                    name: '',
                    image: '',
                    websiteUrl: ''
                }
            }));
        } catch (err) {
            console.error('Error executing query:', err);
            throw err;
        }
    }

    public async bulkProductInsert(products : IProductDTO[], brandId: number): Promise<number>{
        const values: any[] = [];
        const valuePlaceholders: string[] = [];

        products.forEach((product, index) => {
            const offset = index * 5;
            valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
            values.push(product.name, product.price, product.description, product.images,brandId);
        });

        const query = `
        INSERT INTO Products (name, price, description, images, brand_id)
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

    async markProductAsTagged(productId: string): Promise<void> {
        const query: string = `UPDATE Products
            SET has_tags_generated = TRUE
            WHERE id = $1;`;

        try {
            const result = await pool.query(query, [productId]);

            if (result.rowCount === 0) {
                // TODO HANDLE THIS
                throw new Error(`Product with ID ${productId} not found.`);
            }

            console.log(`Product with ID ${productId} has been marked as tagged.`);
        } catch (error) {
            console.error(`Error marking product as tagged: ${error.message}`);
            throw error;
        }
    }

    private constructListQuery(params: IListProductsParams): { query: string, values: any[] } {
        let query = `SELECT * FROM products`;
        const conditions: string[] = [];
        const values: any[] = [];

        if (params.search && params.search.trim().length > 1) {
            const sanitizedSearch = params.search.replace(/\s+/g, ':*').replace(/[^a-zA-Z0-9\s]/g, '*') + ':*';
            conditions.push(`tsv @@ to_tsquery('spanish', $${values.length + 1})`);
            values.push(sanitizedSearch);
        }

        if (params.brandId) {
            conditions.push(`brand_id = $${values.length + 1}`);
            values.push(params.brandId);
        }

        if(params.tagged){
            conditions.push(`has_tags_generated = $${values.length + 1}`);
            values.push(params.tagged);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }


        query += `;`;

        return { query, values };
    }

}


export const productRepository = new ProductsRepository(pool);