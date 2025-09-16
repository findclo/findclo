import pool from "@/lib/backend/conf/db.connections";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { ProductNotFoundException } from "@/lib/backend/exceptions/productNotFound.exception";
import { BrandStatus } from "@/lib/backend/models/interfaces/brand.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { ITag } from "@/lib/backend/models/interfaces/tag.interface";
import { Pool, QueryResult } from "pg";

export interface IListProductsParams {
    search?: string;
    brandId?: number;
    tagged?: boolean;
    tags?: string[];
    productId?: number;
    userQuery?: boolean;
    excludeBrandPaused?: boolean;
    featured?: boolean;
    isLandingPage?: boolean;
    skipAI?: boolean;
}


class ProductsRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    public async getProductById(productId: number, excludeBrandPaused: boolean): Promise<IProduct | null> {
        let query = `SELECT p.*, b.status as brand_status, b.name as brand_name
                     FROM Products p
                              JOIN Brands b ON p.brand_id = b.id
                     WHERE p.id = $1`;
        const values: any[] = [productId];

        if (excludeBrandPaused) {
            query += ` AND b.status != $2`;
            values.push(BrandStatus.PAUSED);
        }

        try {
            const res = await this.db.query(query, values);
            if (res.rowCount == null || res.rowCount <= 0) {
                return null;
            }
            return this.mapProductRows(res.rows)[0];
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    public async listProducts(params: IListProductsParams, tags?: ITag[], searchEmbedding?: number[]): Promise<IProduct[]> {
        const uniqueTags = tags?.filter((tag, index, self) =>
            index === self.findIndex((t) => t.name === tag.name)
        );
        const {query, values} = this.constructListQuery(params, uniqueTags, searchEmbedding);
        try {
            const res = await this.db.query(query, values);
            return this.mapProductRows(res.rows);
        } catch (err) {
            console.error('Error executing query:', err);
            throw err;
        }
    }

    public async bulkProductInsert(products: IProductDTO[], brandId: string): Promise<IProduct[]> {
        const valuePlaceholders = products.map((_, index) => {
            const offset = index * 8;
            return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, 
            to_tsvector('spanish', coalesce($${offset + 6}, '') || ' ' || coalesce($${offset + 7}, '')),$${offset + 8}
        )`;
        });

        const values = products.flatMap(product => [
            product.name,
            product.price,
            product.description,
            product.images,
            brandId,
            product.name,
            product.description,
            product.url
        ]);

        const query = `
            INSERT INTO Products (name, price, description, images, brand_id, tsv, url)
            VALUES ${valuePlaceholders.join(', ')}
        `;


        try {
            const res = await pool.query(query, values);
            console.log('Products inserted successfully');
            return this.mapProductRows(res.rows);
        } catch (error) {
            console.error('Error inserting products:', error);
            return [];
        }
    }

    public async createProduct(product: IProductDTO, brandId: string): Promise<IProduct> {
        const query = `INSERT INTO Products (name, price, description, images, brand_id, tsv, url)
                           VALUES ($1, $2, $3, $4, $5,
                                   to_tsvector('spanish', coalesce($6, '') || ' ' || coalesce($7, '')), $8)
                               RETURNING *`;
        const values = [product.name, product.price, product.description, product.images, brandId, product.name, product.description, product.url];
        try {
            const res = await pool.query(query, values);
            return this.mapProductRows(res.rows)[0];
        } catch (error) {
            console.error('Error inserting product:', error);
            throw error;
        }
    }

    async markProductAsTagged(productId: number): Promise<void> {
        this.markProductIsTagged(productId, true);
    }

    async markProductAsUntagged(productId: number): Promise<void> {
        this.markProductIsTagged(productId, false);
    }


    private async markProductIsTagged(productId: number, isTagged: boolean): Promise<void> {
        const query: string = `UPDATE Products
                               SET has_tags_generated = $1
                               WHERE id = $2;`;

        try {
            const result = await pool.query(query, [isTagged, productId]);

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
        const query = `UPDATE Products
                       SET status = $1
                       WHERE id = $2`;
        const values = ['DELETED', id];

        try {
            const res = await this.db.query(query, values);
            return res.rowCount != null ? res.rowCount > 0 : false;
        } catch (error: any) {
            console.log(error);
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
                url = $5,
                has_tags_generated = false,
                uploaded_to_blob = false,
                tsv = to_tsvector('spanish', coalesce($1, '') || ' ' || coalesce($3, ''))
            WHERE id = $6
                RETURNING *
        `;

        const values = [product.name, product.price, product.description, product.images, product.url, id];
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

    async updateProductImages(productId: number, images: string[]): Promise<void> {
        const query = `
            UPDATE Products
            SET images = $1
            WHERE id = $2
        `;

        const values = [images, productId];
        
        try {
            const res = await this.db.query(query, values);
            if (res.rowCount === 0) {
                throw new ProductNotFoundException(productId);
            }
            console.log(`Successfully updated images for product ${productId}`);
        } catch (error) {
            console.error(`Error updating product images for ${productId}:`, error);
            throw error;
        }
    }

    async getUnuploadedProducts(limit: number): Promise<IProduct[]> {
        const query = `
            SELECT p.*, b.status as brand_status
            FROM Products p
            JOIN Brands b ON p.brand_id = b.id
            WHERE p.uploaded_to_blob = false 
            AND p.status NOT IN ('DELETED')
            ORDER BY p.id ASC
            LIMIT $1
        `;
        
        try {
            const res = await this.db.query(query, [limit]);
            return this.mapProductRows(res.rows);
        } catch (error) {
            console.error('Error getting unuploaded products:', error);
            throw error;
        }
    }

    async markAsUploadedToBlob(productId: number): Promise<void> {
        const query = `
            UPDATE Products
            SET uploaded_to_blob = true
            WHERE id = $1
        `;
        
        try {
            const res = await this.db.query(query, [productId]);
            if (res.rowCount === 0) {
                throw new ProductNotFoundException(productId);
            }
            console.log(`Marked product ${productId} as uploaded to blob`);
        } catch (error) {
            console.error(`Error marking product ${productId} as uploaded:`, error);
            throw error;
        }
    }

    async resetUploadedToBlobFlag(productId: number): Promise<void> {
        const query = `
            UPDATE Products
            SET uploaded_to_blob = false
            WHERE id = $1
        `;
        
        try {
            const res = await this.db.query(query, [productId]);
            if (res.rowCount === 0) {
                throw new ProductNotFoundException(productId);
            }
            console.log(`Reset uploaded_to_blob flag for product ${productId}`);
        } catch (error) {
            console.error(`Error resetting flag for product ${productId}:`, error);
            throw error;
        }
    }

    async updateProductEmbedding(productId: number, embedding: number[]): Promise<void> {
        const query = `
            UPDATE Products
            SET embedding = $1
            WHERE id = $2
        `;
        
        try {
            const res = await this.db.query(query, [`[${embedding.join(',')}]`, productId]);
            if (res.rowCount === 0) {
                throw new ProductNotFoundException(productId);
            }
            console.log(`Updated embedding for product ${productId}`);
        } catch (error) {
            console.error(`Error updating embedding for product ${productId}:`, error);
            throw error;
        }
    }

    async getProductsWithoutEmbedding(limit: number): Promise<IProduct[]> {
        const query = `
            SELECT p.*, b.status as brand_status
            FROM Products p
            JOIN Brands b ON p.brand_id = b.id
            WHERE p.embedding IS NULL 
            AND p.status NOT IN ('DELETED')
            AND (p.name IS NOT NULL AND p.name != '')
            ORDER BY p.id ASC
            LIMIT $1
        `;
        
        try {
            const res = await this.db.query(query, [limit]);
            return this.mapProductRows(res.rows);
        } catch (error) {
            console.error('Error getting products without embedding:', error);
            throw error;
        }
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
        if (rows.length == 0) {
            return [];
        }
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price),
            description: row.description,
            images: row.images && row.images.length > 0 ? row.images : [],
            status: row.status,
            url: row.url,
            brand: {
                id: row.brand_id,
                name: row.brand_name,
                image: '',
                websiteUrl: '',
                status: BrandStatus.ACTIVE, // this is to avoid tslint checks
                description: ''
            }
        }));
    }

    private constructListQuery(params: IListProductsParams, tags?: ITag[], searchEmbedding?: number[]): { query: string, values: any[] } {
        let query = `SELECT DISTINCT p.*`;
        
        // Add similarity score if we have embedding
        if (searchEmbedding && searchEmbedding.length > 0) {
            query += `, (1 - (p.embedding <=> $${1}::vector)) AS similarity`;
        }
        
        query += ` FROM products p`;
        let searchByTsQuery : string = '';
        const conditions: string[] = [];
        const values: any[] = [];
        
        // Add embedding as first parameter if provided
        if (searchEmbedding && searchEmbedding.length > 0) {
            values.push(`[${searchEmbedding.join(',')}]`);
        }

        if (params.featured) {
            query += ` JOIN promotions prom ON prom.product_id = p.id`;
            conditions.push(`prom.is_active = true`);
            conditions.push(`prom.credits_spent < prom.credits_allocated`);
            if(params.isLandingPage){
                conditions.push(`prom.show_on_landing = true`);
            }
        }

        if (params.excludeBrandPaused) {
            query += ' JOIN Brands b ON p.brand_id = b.id ';
            conditions.push(`b.status != $${values.length + 1}`);
            values.push(BrandStatus.PAUSED);
        }

        if (tags && tags.length > 0) {
            query += ` JOIN Product_Tags pt ON p.id = pt.product_id
                       JOIN Tags t ON pt.tag_id = t.id`;
            const tagNames = tags.map(tag => tag.name);
            const tagPlaceholders = tagNames.map((_, idx) => `$${values.length + idx + 1}`);
            conditions.push(`t.name IN (${tagPlaceholders.join(', ')})`);
            values.push(...tagNames);
        }

        // Handle search: prioritize vector search if we have embedding, fallback to text search
        if (params.search && params.search.trim().length > 0) {
            if (searchEmbedding && searchEmbedding.length > 0) {
                // Vector search: filter by similarity threshold
                conditions.push(`p.embedding IS NOT NULL`);
                conditions.push(`(1 - (p.embedding <=> $1)) >= 0.4`); // Similarity threshold
            } else {
                // Fallback to text search if no embedding
                if (tags && tags.length > 0) {
                    searchByTsQuery = `UNION SELECT p.* FROM products p where tsv @@ plainto_tsquery('spanish', $${values.length + 1})`
                } else {
                    conditions.push(`tsv @@ plainto_tsquery('spanish', $${values.length + 1})`);
                }
                
                const sanitizedSearch = params.search
                    .trim()
                    .replace(/[^a-zA-Z0-9\sáéíóúÁÉÍÓÚüÜ]/g, '')
                    .split(/\s+/)
                    .map(word => word.toLowerCase())
                    .join(' & ');

                values.push(sanitizedSearch);
            }
        }

        if (params.brandId) {
            conditions.push(`p.brand_id = $${values.length + 1}`);
            values.push(params.brandId);
        }

        if (params.tagged != undefined && !params.tagged) {
            conditions.push(`p.has_tags_generated = $${values.length + 1}`);
            values.push(params.tagged);
        }

        // Add condition to exclude PAUSED products when userQuery is true
        if (params.userQuery) {
            conditions.push(`p.status NOT IN ('PAUSED', 'DELETED')`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        if (tags && tags.length > 0) {
            query += ` GROUP BY p.id HAVING COUNT(DISTINCT t.name) = ${tags.length} `;
        } else {
            query += ` GROUP BY p.id `;
        }

        if (searchByTsQuery != '') {
            query += searchByTsQuery;
        }

        // Add ordering: prioritize vector similarity if available, then by ID
        if (searchEmbedding && searchEmbedding.length > 0) {
            query += ` ORDER BY similarity DESC, p.id DESC`;
        } else {
            query += ` ORDER BY p.id DESC`;
        }

        // Add limit for performance
        query += ` LIMIT 100`;

        console.log(query, values);
        return {query, values};
    }

}


export const productRepository = new ProductsRepository(pool);
