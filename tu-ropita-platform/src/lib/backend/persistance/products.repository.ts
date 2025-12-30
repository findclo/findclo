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
    includeDeleted?: boolean;
    // Brand detection parameters
    detectedBrandIds?: number[];
    brandBoostScores?: Map<number, number>;
    isExactBrandMatch?: boolean;
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
        let query = `SELECT p.*, b.status as brand_status, b.name as brand_name, b.image as brand_image, b.websiteUrl as brand_websiteUrl, b.description as brand_description`;

        // Include category aggregations if requested
        if (includeCategories) {
            query += this.getCategoryAggregations();
        }

        // Include attribute aggregations if requested
        if (includeAttributes) {
            query += this.getAttributeAggregations();
        }

        query += ` FROM Products p JOIN Brands b ON p.brand_id = b.id`;

        // Add category joins if requested
        if (includeCategories) {
            query += this.getCategoryJoins();
        }

        // Add attribute joins if requested
        if (includeAttributes) {
            query += this.getAttributeJoins();
        }

        query += ` WHERE p.id = $1`;
        const values: any[] = [productId];

        if (excludeBrandPaused) {
            query += ` AND b.status != $2`;
            values.push(BrandStatus.PAUSED);
        }

        // Add GROUP BY when including categories or attributes
        if (includeCategories || includeAttributes) {
            query += ` GROUP BY p.id, b.id`;
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

    public async countProducts(params: IListProductsParams, searchEmbedding?: number[]): Promise<number> {
        const { query: listQuery, values } = this.constructListQuery(params, searchEmbedding);

        // Extract the WHERE clause and FROM clause from the list query
        // Remove the SELECT, GROUP BY, ORDER BY, LIMIT, and OFFSET parts
        const fromIndex = listQuery.indexOf('FROM products');
        const groupByIndex = listQuery.indexOf('GROUP BY');

        if (fromIndex === -1) {
            throw new Error('Invalid query structure for counting');
        }

        // Build count query - we need to count distinct product IDs due to joins
        let countQuery = `SELECT COUNT(DISTINCT p.id) as total ${listQuery.substring(fromIndex, groupByIndex !== -1 ? groupByIndex : listQuery.indexOf('ORDER BY'))}`;

        try {
            const res = await this.db.query(countQuery, values.slice(0, values.length - (params.page && params.page > 1 ? 2 : 1))); // Remove LIMIT and possibly OFFSET values
            return parseInt(res.rows[0].total);
        } catch (err) {
            console.error('Error executing count query:', err);
            throw err;
        }
    }

    public async countProductsByBrand(brandId: number): Promise<number> {
        const query = `SELECT COUNT(*) as total FROM products p WHERE p.brand_id = $1 AND p.status != 'DELETED'`;
        const values = [brandId];

        try {
            const res = await this.db.query(query, values);
            return parseInt(res.rows[0].total);
        } catch (err) {
            console.error('Error executing count by brand query:', err);
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
        await this.executeSimpleUpdate(
            productId,
            'images',
            images,
            `Successfully updated images for product ${productId}`
        );
    }

    async getUnuploadedProducts(limit: number): Promise<IProduct[]> {
        return this.getProductsWithCondition('p.uploaded_to_blob = false', limit);
    }

    async markAsUploadedToBlob(productId: number): Promise<void> {
        await this.executeSimpleUpdate(
            productId,
            'uploaded_to_blob',
            true,
            `Marked product ${productId} as uploaded to blob`
        );
    }

    async resetUploadedToBlobFlag(productId: number): Promise<void> {
        await this.executeSimpleUpdate(
            productId,
            'uploaded_to_blob',
            false,
            `Reset uploaded_to_blob flag for product ${productId}`
        );
    }

    async updateProductEmbedding(productId: number, embedding: number[]): Promise<void> {
        await this.executeSimpleUpdate(
            productId,
            'embedding',
            `[${embedding.join(',')}]`,
            `Updated embedding for product ${productId}`
        );
    }

    async getProductsWithoutEmbedding(limit: number): Promise<IProduct[]> {
        return this.getProductsWithCondition(
            "p.embedding IS NULL AND (p.name IS NOT NULL AND p.name != '')",
            limit
        );
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

    private async executeSimpleUpdate(
        productId: number,
        field: string,
        value: any,
        successMessage: string
    ): Promise<void> {
        const query = `
            UPDATE Products
            SET ${field} = $1
            WHERE id = $2
        `;

        try {
            const res = await this.db.query(query, [value, productId]);
            if (res.rowCount === 0) {
                throw new ProductNotFoundException(productId);
            }
            console.log(successMessage);
        } catch (error) {
            console.error(`Error updating ${field} for product ${productId}:`, error);
            throw error;
        }
    }

    private parseAggregatedField(row: any, field: string, separator: string): string[] {
        if (!row[field]) return [];
        return row[field].split(separator).filter((item: string) => item && item.trim());
    }

    private async getProductsWithCondition(condition: string, limit: number): Promise<IProduct[]> {
        const query = `
            SELECT p.*, b.status as brand_status, b.name as brand_name, b.image as brand_image, b.websiteUrl as brand_websiteUrl, b.description as brand_description
            FROM Products p
            JOIN Brands b ON p.brand_id = b.id
            WHERE ${condition}
            AND p.status NOT IN ('DELETED')
            ORDER BY p.id ASC
            LIMIT $1
        `;

        try {
            const res = await this.db.query(query, [limit]);
            return this.mapProductRows(res.rows);
        } catch (error) {
            console.error('Error getting products with condition:', error);
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
                    name: row.brand_name || '',
                    image: row.brand_image || '',
                    websiteUrl: row.brand_websiteUrl || '',
                    status: row.brand_status || BrandStatus.ACTIVE,
                    description: row.brand_description || ''
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
        if (row.categories_json && Array.isArray(row.categories_json)) {
            baseProduct.categories = row.categories_json.map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                parent_id: cat.parent_id,
                sort_order: cat.sort_order || 0,
                level: cat.level,
                description: cat.description || undefined,
                created_at: cat.created_at ? new Date(cat.created_at) : new Date(),
                updated_at: cat.updated_at ? new Date(cat.updated_at) : new Date()
            }));
        } else {
            baseProduct.categories = [];
        }
    }


    private constructListQuery(params: IListProductsParams, searchEmbedding?: number[]): { query: string, values: any[] } {
        let query = `SELECT p.*, b.status as brand_status, b.name as brand_name, b.image as brand_image, b.websiteUrl as brand_websiteUrl, b.description as brand_description`;

        // Add similarity score for semantic search
        if (searchEmbedding && searchEmbedding.length > 0) {
            query += `, (1 - (p.embedding <=> $${1}::vector)) AS similarity`;
        }

        // Add brand boost score for hybrid ranking
        if (params.brandBoostScores && params.brandBoostScores.size > 0) {
            query += `, CASE `;
            params.brandBoostScores.forEach((score, brandId) => {
                query += `WHEN p.brand_id = ${brandId} THEN ${score} `;
            });
            query += `ELSE 0.0 END AS brand_boost`;

            // Calculate combined score for hybrid ranking
            if (searchEmbedding && searchEmbedding.length > 0) {
                query += `, (CASE `;
                params.brandBoostScores.forEach((score, brandId) => {
                    query += `WHEN p.brand_id = ${brandId} THEN ${score} `;
                });
                query += `ELSE 0.0 END + (1 - (p.embedding <=> $1::vector)) * 0.5) AS combined_score`;
            } else {
                query += `, CASE `;
                params.brandBoostScores.forEach((score, brandId) => {
                    query += `WHEN p.brand_id = ${brandId} THEN ${score} `;
                });
                query += `ELSE 0.0 END AS combined_score`;
            }
        }

        if (params.includeCategories) {
            query += this.getCategoryAggregations();
        }
        if (params.includeAttributes) {
            query += this.getAttributeAggregations();
        }

        query += ` FROM products p`;
        query += ' JOIN Brands b ON p.brand_id = b.id ';
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
            conditions.push(`b.status != $${values.length + 1}`);
            values.push(BrandStatus.PAUSED);
        }

        // Handle category filtering and/or inclusion
        const needsCategoryJoin = (params.categoryIds && params.categoryIds.length > 0) ||
                                 params.categoryId ||
                                 params.includeCategories;

        if (needsCategoryJoin) {
            query += this.getCategoryJoins();

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
            query += this.getAttributeJoins();

            // Add filtering condition when filtering by attribute values
            if (params.attributeValueIds && params.attributeValueIds.length > 0) {
                conditions.push(`pa.attribute_value_id = ANY($${values.length + 1})`);
                values.push(params.attributeValueIds);
            }
        }


        // Handle search with brand detection support
        if (params.search && params.search.trim().length > 0) {
            if (searchEmbedding && searchEmbedding.length > 0) {
                // Adaptive filtering based on brand detection
                if (params.isExactBrandMatch && params.detectedBrandIds && params.detectedBrandIds.length > 0) {
                    // EXACT BRAND MATCH: Strict filtering - show only detected brand products
                    conditions.push(`p.brand_id = ANY($${values.length + 1})`);
                    values.push(params.detectedBrandIds);
                    // Still require valid embedding for semantic ranking within brand
                    conditions.push(`p.embedding IS NOT NULL`);
                } else if (!params.isExactBrandMatch && params.detectedBrandIds && params.detectedBrandIds.length > 0) {
                    // FUZZY BRAND MATCH: Boosting - show brand products + semantically similar products
                    conditions.push(`(p.brand_id = ANY($${values.length + 1}) OR ((1 - (p.embedding <=> $1)) >= 0.5 AND p.embedding IS NOT NULL))`);
                    values.push(params.detectedBrandIds);
                } else {
                    // NO BRAND MATCH: Pure semantic search
                    conditions.push(`p.embedding IS NOT NULL`);
                    conditions.push(`(1 - (p.embedding <=> $1)) >= 0.5`);
                }
            } else {
                // Fallback to text search when no embeddings
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

        // Exclude DELETED products unless includeDeleted is true
        if (!params.includeDeleted) {
            conditions.push(`p.status != 'DELETED'`);
        }

        // Add condition to exclude PAUSED products when userQuery is true
        if (params.userQuery) {
            conditions.push(`p.status NOT IN ('PAUSED', 'PAUSED_BY_ADMIN')`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` GROUP BY p.id, b.id`;

        if (searchByTsQuery != '') {
            query += searchByTsQuery;
        }

        // Ordering: prioritize combined score when brand boosting is active
        if (params.brandBoostScores && params.brandBoostScores.size > 0) {
            query += ` ORDER BY combined_score DESC, p.id DESC`;
        } else if (searchEmbedding && searchEmbedding.length > 0) {
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

        return { query, values };
    }

    private mapAttributesToProduct(row: any, baseProduct: IProduct) {
        const attributes: IProductAttributeDetail[] = [];

        if (row.attributes_json && Array.isArray(row.attributes_json)) {
            baseProduct.attributes = row.attributes_json.map((attr: any) => ({
                attribute_id: attr.attribute_id,
                attribute_name: attr.attribute_name,
                attribute_slug: attr.attribute_slug,
                value_id: attr.value_id,
                value: attr.value,
                value_slug: attr.value_slug
            }));
        } else {
            baseProduct.attributes = [];
        }
    }
    
    private getCategoryAggregations(): string {
        return `, jsonb_agg(DISTINCT jsonb_build_object(
                'id', c.id,
                'name', c.name,
                'slug', c.slug,
                'parent_id', c.parent_id,
                'sort_order', 0,
                'level', c.level,
                'description', c.description,
                'created_at', c.created_at,
                'updated_at', c.updated_at
            )) FILTER (WHERE c.id IS NOT NULL) as categories_json`;
    }

    private getAttributeAggregations(): string {
        return `, jsonb_agg(DISTINCT jsonb_build_object(
                'attribute_id', a.id,
                'attribute_name', a.name,
                'attribute_slug', a.slug,
                'value_id', av.id,
                'value', av.value,
                'value_slug', av.slug
            )) FILTER (WHERE a.id IS NOT NULL AND av.id IS NOT NULL) as attributes_json`;
    }

    private getCategoryJoins(): string {
        return ` LEFT JOIN product_categories pc ON p.id = pc.product_id
                 LEFT JOIN Category c ON pc.category_id = c.id`;
    }

    private getAttributeJoins(): string {
        return ` LEFT JOIN product_attributes pa ON p.id = pa.product_id
                 LEFT JOIN attributes a ON pa.attribute_id = a.id
                 LEFT JOIN attribute_values av ON pa.attribute_value_id = av.id`;
    }
}


export const productRepository = new ProductsRepository(pool);
