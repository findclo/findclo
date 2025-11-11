import pool from "@/lib/backend/conf/db.connections";
import { AttributeNotFoundException, AttributeValueNotFoundException } from "@/lib/backend/exceptions/attributeNotFoundException";
import {
    IAttribute,
    IAttributeValue,
    IAttributeWithValues,
    IProductAttributeDetail
} from "@/lib/backend/models/interfaces/attribute.interface";
import {
    IAttributeCreateDTO,
    IAttributeValueCreateDTO,
    IProductAttributesAssignDTO
} from "@/lib/backend/dtos/attribute.dto.interface";
import { Pool } from "pg";

class AttributeRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    // ========== ATTRIBUTES CRUD ==========

    async createAttribute(data: IAttributeCreateDTO, slug: string): Promise<IAttribute> {
        const query = `
            INSERT INTO attributes (name, slug)
            VALUES ($1, $2)
            RETURNING id, name, slug, created_at, updated_at
        `;

        const values = [
            data.name,
            slug
        ];

        try {
            const result = await this.db.query(query, values);
            return this.mapAttributeRow(result.rows[0]);
        } catch (error) {
            console.error('Error creating attribute:', error);
            throw new Error('Failed to create attribute.');
        }
    }

    async deleteAttribute(id: number): Promise<boolean> {
        const query = 'DELETE FROM attributes WHERE id = $1';
        try {
            const result = await this.db.query(query, [id]);
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting attribute:', error);
            throw new Error('Failed to delete attribute.');
        }
    }

    async getAttributeById(id: number): Promise<IAttribute> {
        const query = `
            SELECT id, name, slug, created_at, updated_at
            FROM attributes WHERE id = $1
        `;
        const result = await this.db.query(query, [id]);
        if (result.rows.length === 0) {
            throw new AttributeNotFoundException(id);
        }
        return this.mapAttributeRow(result.rows[0]);
    }

    async getAttributeBySlug(slug: string): Promise<IAttribute> {
        const query = `
            SELECT id, name, slug, created_at, updated_at
            FROM attributes WHERE slug = $1
        `;
        const result = await this.db.query(query, [slug]);
        if (result.rows.length === 0) {
            throw new AttributeNotFoundException(slug);
        }
        return this.mapAttributeRow(result.rows[0]);
    }

    async listAttributes(): Promise<IAttribute[]> {
        const query = `
            SELECT id, name, slug, created_at, updated_at
            FROM attributes
            ORDER BY name
        `;

        try {
            const result = await this.db.query(query);
            return result.rows.map(row => this.mapAttributeRow(row));
        } catch (error) {
            console.error('Error listing attributes:', error);
            throw new Error('Failed to list attributes.');
        }
    }

    async getAttributeWithValues(attributeId: number): Promise<IAttributeWithValues> {
        const attribute = await this.getAttributeById(attributeId);
        const values = await this.listAttributeValues(attributeId);

        return {
            ...attribute,
            values
        };
    }

    async listAttributesWithValues(): Promise<IAttributeWithValues[]> {
        const attributes = await this.listAttributes();

        const attributesWithValues = await Promise.all(
            attributes.map(async (attribute) => {
                const values = await this.listAttributeValues(attribute.id);
                return {
                    ...attribute,
                    values
                };
            })
        );

        return attributesWithValues;
    }

    // ========== ATTRIBUTE VALUES CRUD ==========

    async createAttributeValue(attributeId: number, data: IAttributeValueCreateDTO, slug: string): Promise<IAttributeValue> {
        const query = `
            INSERT INTO attribute_values (attribute_id, value, slug)
            VALUES ($1, $2, $3)
            RETURNING id, attribute_id, value, slug, created_at, updated_at
        `;

        const values = [
            attributeId,
            data.value,
            slug
        ];

        try {
            const result = await this.db.query(query, values);
            return this.mapAttributeValueRow(result.rows[0]);
        } catch (error) {
            console.error('Error creating attribute value:', error);
            throw new Error('Failed to create attribute value.');
        }
    }

    async deleteAttributeValue(valueId: number): Promise<boolean> {
        const query = 'DELETE FROM attribute_values WHERE id = $1';
        try {
            const result = await this.db.query(query, [valueId]);
            return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
            console.error('Error deleting attribute value:', error);
            throw new Error('Failed to delete attribute value.');
        }
    }

    async listAttributeValues(attributeId: number): Promise<IAttributeValue[]> {
        const query = `
            SELECT id, attribute_id, value, slug, created_at, updated_at
            FROM attribute_values
            WHERE attribute_id = $1
            ORDER BY value
        `;

        try {
            const result = await this.db.query(query, [attributeId]);
            return result.rows.map(row => this.mapAttributeValueRow(row));
        } catch (error) {
            console.error('Error listing attribute values:', error);
            throw new Error('Failed to list attribute values.');
        }
    }

    async getAttributeValueBySlug(attributeId: number, slug: string): Promise<IAttributeValue> {
        const query = `
            SELECT id, attribute_id, value, slug, created_at, updated_at
            FROM attribute_values
            WHERE attribute_id = $1 AND slug = $2
        `;
        const result = await this.db.query(query, [attributeId, slug]);
        if (result.rows.length === 0) {
            throw new AttributeValueNotFoundException(`${attributeId}:${slug}`);
        }
        return this.mapAttributeValueRow(result.rows[0]);
    }

    // ========== PRODUCT ATTRIBUTES ==========

    async assignAttributesToProduct(productId: number, data: IProductAttributesAssignDTO): Promise<void> {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM product_attributes WHERE product_id = $1', [productId]);
            for (const attr of data.attributes) {
                for (const valueId of attr.value_ids) {
                    const insertQuery = `
                        INSERT INTO product_attributes (product_id, attribute_id, attribute_value_id)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (product_id, attribute_id, attribute_value_id) DO NOTHING
                    `;
                    await client.query(insertQuery, [productId, attr.attribute_id, valueId]);
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error assigning attributes to product:', error);
            throw new Error('Failed to assign attributes to product.');
        } finally {
            client.release();
        }
    }

    async removeProductAttributes(productId: number, attributeIds?: number[]): Promise<void> {
        let query = 'DELETE FROM product_attributes WHERE product_id = $1';
        const values: any[] = [productId];

        if (attributeIds && attributeIds.length > 0) {
            query += ' AND attribute_id = ANY($2)';
            values.push(attributeIds);
        }

        try {
            await this.db.query(query, values);
        } catch (error) {
            console.error('Error removing product attributes:', error);
            throw new Error('Failed to remove product attributes.');
        }
    }

    async assignAttributesToMultipleProducts(productIds: number[], data: IProductAttributesAssignDTO): Promise<void> {
        if (productIds.length === 0 || data.attributes.length === 0) return;

        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            for (const productId of productIds) {
                for (const attr of data.attributes) {
                    for (const valueId of attr.value_ids) {
                        const insertQuery = `
                            INSERT INTO product_attributes (product_id, attribute_id, attribute_value_id)
                            VALUES ($1, $2, $3)
                            ON CONFLICT (product_id, attribute_id, attribute_value_id) DO NOTHING
                        `;
                        await client.query(insertQuery, [productId, attr.attribute_id, valueId]);
                    }
                }
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error assigning attributes to multiple products:', error);
            throw new Error('Failed to assign attributes to multiple products.');
        } finally {
            client.release();
        }
    }

    async removeAttributesFromMultipleProducts(productIds: number[], attributeIds: number[]): Promise<void> {
        if (productIds.length === 0 || attributeIds.length === 0) return;

        const query = `
            DELETE FROM product_attributes
            WHERE product_id = ANY($1) AND attribute_id = ANY($2)
        `;

        try {
            await this.db.query(query, [productIds, attributeIds]);
        } catch (error) {
            console.error('Error removing attributes from multiple products:', error);
            throw new Error('Failed to remove attributes from multiple products.');
        }
    }

    async getProductAttributes(productId: number): Promise<IProductAttributeDetail[]> {
        const query = `
            SELECT
                a.id as attribute_id,
                a.name as attribute_name,
                a.slug as attribute_slug,
                av.id as value_id,
                av.value as value,
                av.slug as value_slug
            FROM product_attributes pa
            JOIN attributes a ON pa.attribute_id = a.id
            JOIN attribute_values av ON pa.attribute_value_id = av.id
            WHERE pa.product_id = $1
            ORDER BY a.name, av.value
        `;

        try {
            const result = await this.db.query(query, [productId]);
            return result.rows.map(row => this.mapProductAttributeDetailRow(row));
        } catch (error) {
            console.error('Error getting product attributes:', error);
            throw new Error('Failed to get product attributes.');
        }
    }

    async getProductsByAttributeValues(attributeValueIds: number[]): Promise<number[]> {
        if (attributeValueIds.length === 0) return [];

        const query = `
            SELECT DISTINCT product_id
            FROM product_attributes
            WHERE attribute_value_id = ANY($1)
            ORDER BY product_id
        `;

        try {
            const result = await this.db.query(query, [attributeValueIds]);
            return result.rows.map(row => row.product_id);
        } catch (error) {
            console.error('Error getting products by attribute values:', error);
            throw new Error('Failed to get products by attribute values.');
        }
    }

    // ========== MAPPERS ==========

    private mapAttributeRow(row: any): IAttribute {
        return {
            id: row.id,
            name: row.name,
            slug: row.slug,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    private mapAttributeValueRow(row: any): IAttributeValue {
        return {
            id: row.id,
            attribute_id: row.attribute_id,
            value: row.value,
            slug: row.slug,
            created_at: new Date(row.created_at),
            updated_at: new Date(row.updated_at)
        };
    }

    private mapProductAttributeDetailRow(row: any): IProductAttributeDetail {
        return {
            attribute_id: row.attribute_id,
            attribute_name: row.attribute_name,
            attribute_slug: row.attribute_slug || '',
            value_id: row.value_id,
            value: row.value,
            value_slug: row.value_slug || '',
        };
    }
}

export const attributeRepository = new AttributeRepository(pool);
