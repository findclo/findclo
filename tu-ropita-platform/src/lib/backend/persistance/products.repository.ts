import pool from "@/lib/backend/conf/db.connections";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { ProductNotFoundException } from "@/lib/backend/exceptions/productNotFound.exception";
import { IProductAttributeDetail } from "@/lib/backend/models/interfaces/attribute.interface";
import { BrandStatus } from "@/lib/backend/models/interfaces/brand.interface";
import { ICategory } from "@/lib/backend/models/interfaces/category.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { Pool, QueryResult } from "pg";

export interface IListProductsParams {
    search?: string;
    brandId?: number;
    brandIds?: number[];
    tagged?: boolean;
    productId?: number;
    userQuery?: boolean;
    excludeBrandPaused?: boolean;
    featured?: boolean;
    isLandingPage?: boolean;
    skipAI?: boolean;
    categoryId?: number;
    categoryIds?: number[];
    page?: number;
    limit?: number;
    sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
    includeCategories?: boolean;
    attributeValueIds?: number[];
    includeAttributes?: boolean;
}


class ProductsRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    public async getProductById(
        productId: number,
        excludeBrandPaused: boolean,
        includeCategories: boolean = false,
        includeAttributes: boolean = false
    ): Promise<IProduct | null> {
        let query = `SELECT p.*, b.status as brand_status, b.name as brand_name`;

        // Include category aggregations if requested
        if (includeCategories) {
            query += `, string_agg(DISTINCT c.id::text, ',') as category_ids,
            string_agg(c.name, '||') as category_names,
            string_agg(c.slug, '||') as category_slugs,
            string_agg(c.parent_id::text, ',') as category_parent_ids,
            string_agg(c.level::text, ',') as category_levels,
            string_agg(c.description, '||') as category_descriptions`;
        }

        // Include attribute aggregations if requested
        if (includeAttributes) {
            query += `, string_agg(a.id::text, ',' ORDER BY pa.id) as attribute_ids,
            string_agg(a.name, '||' ORDER BY pa.id) as attribute_names,
            string_agg(a.slug, '||' ORDER BY pa.id) as attribute_slugs,
            string_agg(av.id::text, ',' ORDER BY pa.id) as value_ids,
            string_agg(av.value, '||' ORDER BY pa.id) as values,
            string_agg(av.slug, '||' ORDER BY pa.id) as value_slugs`;
        }

        query += ` FROM Products p JOIN Brands b ON p.brand_id = b.id`;

        // Add category joins if requested
        if (includeCategories) {
            query += ` LEFT JOIN product_categories pc ON p.id = pc.product_id
                       LEFT JOIN Category c ON pc.category_id = c.id`;
        }

        // Add attribute joins if requested
        if (includeAttributes) {
            query += ` LEFT JOIN product_attributes pa ON p.id = pa.product_id
                       LEFT JOIN attributes a ON pa.attribute_id = a.id
                       LEFT JOIN attribute_values av ON pa.attribute_value_id = av.id`;
        }

        query += ` WHERE p.id = $1`;
        const values: any[] = [productId];

        if (excludeBrandPaused) {
            query += ` AND b.status != $2`;
            values.push(BrandStatus.PAUSED);
        }

        // Add GROUP BY when including categories or attributes
        if (includeCategories || includeAttributes) {
            query += ` GROUP BY p.id, b.status, b.name`;
        }

        try {
            const res = await this.db.query(query, values);
            if (res.rowCount == null || res.rowCount <= 0) {
                return null;
            }
            return this.mapProductRows(res.rows, includeCategories, includeAttributes)[0];
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    public async listProducts(params: IListProductsParams, searchEmbedding?: number[]): Promise<IProduct[]> {
        const { query, values } = this.constructListQuery(params, searchEmbedding);
        try {
            const res = await this.db.query(query, values);
            return this.mapProductRows(res.rows, params.includeCategories, params.includeAttributes);
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


    private mapProductRows(rows: any[], includeCategories: boolean = false, includeAttributes: boolean = false): IProduct[] {
        if (rows.length === 0) {
            return [];
        }

        return rows.map(row => {
            const baseProduct: IProduct = {
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
                    status: BrandStatus.ACTIVE,
                    description: ''
                }
            };

            if (includeCategories) {
                this.mapCategoriesToProduct(row, baseProduct);
            }

            if (includeAttributes) {
                this.mapAttributesToProduct(row, baseProduct);
            }

            return baseProduct;
        });
    }

    private mapCategoriesToProduct(row: any, baseProduct: IProduct) {
        const categories: ICategory[] = [];

        if (row.category_ids) {
            const categoryIds = row.category_ids.split(',').filter((id: string) => id && id.trim());
            const categoryNames = row.category_names ? row.category_names.split('||').filter((name: string) => name) : [];
            const categorySlugs = row.category_slugs ? row.category_slugs.split('||').filter((slug: string) => slug) : [];
            const categoryParentIds = row.category_parent_ids ? row.category_parent_ids.split(',').filter((id: string) => id && id.trim()) : [];
            const categoryLevels = row.category_levels ? row.category_levels.split(',').filter((level: string) => level && level.trim()) : [];
            const categoryDescriptions = row.category_descriptions ? row.category_descriptions.split('||').filter((desc: string) => desc) : [];

            for (let i = 0; i < categoryIds.length; i++) {
                if (categoryIds[i]) {
                    categories.push({
                        id: parseInt(categoryIds[i]),
                        name: categoryNames[i] || '',
                        slug: categorySlugs[i] || '',
                        parent_id: categoryParentIds[i] ? parseInt(categoryParentIds[i]) : null,
                        sort_order: 0,
                        level: categoryLevels[i] ? parseInt(categoryLevels[i]) : 0,
                        description: categoryDescriptions[i] || null,
                        created_at: new Date(),
                        updated_at: new Date()
                    });
                }
            }
        }

        baseProduct.categories = categories;
    }


    private constructListQuery(params: IListProductsParams, searchEmbedding?: number[]): { query: string, values: any[] } {
        let query = `SELECT p.*`;
        if (searchEmbedding && searchEmbedding.length > 0) {
            query += `, (1 - (p.embedding <=> $${1}::vector)) AS similarity`;
        }
        if (params.includeCategories) {
            query += `, string_agg(DISTINCT c.id::text, ',') as category_ids,
            string_agg(c.name, '||') as category_names,
            string_agg(c.slug, '||') as category_slugs,
            string_agg(c.parent_id::text, ',') as category_parent_ids,
            string_agg(c.level::text, ',') as category_levels,
            string_agg(c.description, '||') as category_descriptions`;
        }
        if (params.includeAttributes) {
            query += `, string_agg(a.id::text, ',' ORDER BY pa.id) as attribute_ids,
            string_agg(a.name, '||' ORDER BY pa.id) as attribute_names,
            string_agg(a.slug, '||' ORDER BY pa.id) as attribute_slugs,
            string_agg(av.id::text, ',' ORDER BY pa.id) as value_ids,
            string_agg(av.value, '||' ORDER BY pa.id) as values,
            string_agg(av.slug, '||' ORDER BY pa.id) as value_slugs`;
        }

        query += ` FROM products p`;
        let searchByTsQuery: string = '';
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

        // Handle category filtering and/or inclusion
        const needsCategoryJoin = (params.categoryIds && params.categoryIds.length > 0) ||
                                 params.categoryId ||
                                 params.includeCategories;

        if (needsCategoryJoin) {
            query += ' LEFT JOIN product_categories pc ON p.id = pc.product_id ';

            // Add category details if including categories
            if (params.includeCategories) {
                query += ' LEFT JOIN Category c ON pc.category_id = c.id ';
            }

            // Add filtering conditions when filtering by category
            if (params.categoryIds && params.categoryIds.length > 0) {
                conditions.push(`pc.category_id = ANY($${values.length + 1})`);
                values.push(params.categoryIds);
            } else if (params.categoryId) {
                conditions.push(`pc.category_id = $${values.length + 1}`);
                values.push(params.categoryId);
            }
        }

        // Handle attribute filtering and/or inclusion
        const needsAttributeJoin = (params.attributeValueIds && params.attributeValueIds.length > 0) ||
            params.includeAttributes;

        if (needsAttributeJoin) {
            query += ' LEFT JOIN product_attributes pa ON p.id = pa.product_id ';

            // Add attribute details if including attributes
            if (params.includeAttributes) {
                query += ' LEFT JOIN attributes a ON pa.attribute_id = a.id ';
                query += ' LEFT JOIN attribute_values av ON pa.attribute_value_id = av.id ';
            }

            // Add filtering condition when filtering by attribute values
            if (params.attributeValueIds && params.attributeValueIds.length > 0) {
                conditions.push(`pa.attribute_value_id = ANY($${values.length + 1})`);
                values.push(params.attributeValueIds);
            }
        }


        // Handle search: prioritize vector search if we have embedding, fallback to text search
        if (params.search && params.search.trim().length > 0) {
            if (searchEmbedding && searchEmbedding.length > 0) {
                conditions.push(`p.embedding IS NOT NULL`);
                conditions.push(`(1 - (p.embedding <=> $1)) >= 0.4`); // Similarity threshold
            } else {
                conditions.push(`tsv @@ plainto_tsquery('spanish', $${values.length + 1})`);

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

        // Add condition to exclude PAUSED products when userQuery is true
        if (params.userQuery) {
            conditions.push(`p.status NOT IN ('PAUSED', 'DELETED')`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` GROUP BY p.id `;

        if (searchByTsQuery != '') {
            query += searchByTsQuery;
        }

        if (searchEmbedding && searchEmbedding.length > 0) {
            query += ` ORDER BY similarity DESC`;
        } else if (params.sort) {
            switch (params.sort) {
                case 'price_asc':
                    query += ` ORDER BY p.price ASC`;
                    break;
                case 'price_desc':
                    query += ` ORDER BY p.price DESC`;
                    break;
                    case 'name_asc':
                        query += ` ORDER BY p.name ASC`;
                        break;
                        case 'name_desc':
                            query += ` ORDER BY p.name DESC`;
                            break;
                            default:
                                query += ` ORDER BY p.id DESC`;
            }
        } else {
            query += ` ORDER BY p.id DESC`;
        }

        // Add pagination
        const limit = params.limit || 100;
        const offset = params.page && params.page > 1 ? (params.page - 1) * limit : 0;

        query += ` LIMIT $${values.length + 1}`;
        values.push(limit);

        if (offset > 0) {
            query += ` OFFSET $${values.length + 1}`;
            values.push(offset);
        }

        console.log(query, values);
        return { query, values };
    }

    private mapAttributesToProduct(row: any, baseProduct: IProduct) {
        const attributes: IProductAttributeDetail[] = [];

        if (row.value_ids) {
            const attributeIds = row.attribute_ids ? row.attribute_ids.split(',').filter((id: string) => id && id.trim()) : [];
            const attributeNames = row.attribute_names ? row.attribute_names.split('||').filter((name: string) => name) : [];
            const attributeSlugs = row.attribute_slugs ? row.attribute_slugs.split('||').filter((slug: string) => slug) : [];
            const valueIds = row.value_ids.split(',').filter((id: string) => id && id.trim());
            const values = row.values ? row.values.split('||').filter((val: string) => val) : [];
            const valueSlugs = row.value_slugs ? row.value_slugs.split('||').filter((slug: string) => slug) : [];

            // Iterate over valueIds instead of attributeIds to handle multiple values per attribute
            for (let i = 0; i < valueIds.length; i++) {
                if (valueIds[i] && attributeIds[i]) {
                    attributes.push({
                        attribute_id: parseInt(attributeIds[i]),
                        attribute_name: attributeNames[i] || '',
                        attribute_slug: attributeSlugs[i] || '',
                        value_id: parseInt(valueIds[i]),
                        value: values[i] || '',
                        value_slug: valueSlugs[i] || '',
                    });
                }
            }
        }

        baseProduct.attributes = attributes;
    }
}


export const productRepository = new ProductsRepository(pool);
