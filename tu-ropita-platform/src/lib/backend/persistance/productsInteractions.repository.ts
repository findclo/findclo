import pool from "@/lib/backend/conf/db.connections";
import { BrandStatus } from "@/lib/backend/models/interfaces/brand.interface";
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface";
import { IProductMetricAggDaily } from "@/lib/backend/models/interfaces/metrics/product.metric.aggDaily.interface";
import { IProductMetric } from "@/lib/backend/models/interfaces/metrics/product.metric.interface";
import { ProductInteractionEnum } from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";
import { Pool } from "pg";

export interface IProductsInteractionsRepository {
    addProductInteraction(productId: string, interaction: ProductInteractionEnum): Promise<void>;
    addListOfProductInteractions(productIds: string[], interaction: ProductInteractionEnum): Promise<void>;
    syncProductMetricsAggDaily(): Promise<void>;
    getProductMetricsBetweenDates(startDate: string, endDate: string, productId: string, brandId?:string): Promise<IProductMetricAggDaily[]>;
    getMetricsBetweenDates(startDate: string, endDate: string, brandId?:string): Promise<IMetrics[]>;
    getMetricByProduct(startDate: string, endDate: string, brandId?:string): Promise<IProductMetric[]>;
}

class ProductsInteractionsRepository implements IProductsInteractionsRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    private async executeQuery(query: string, params: any[]): Promise<void> {
        try {
            await this.db.query(query, params);
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    private async fetchMetrics(query: string, params: any[]): Promise<any[]> {
        try {
            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error fetching metrics:', error);
            throw error;
        }
    }

    private mapProductMetrics(rows: any[]): IProductMetricAggDaily[] {
        return rows.map(row => ({
            product: {
                id: row.product_id,
                name: row.name,
                description: row.description,
                images: row.images,
                status: row.status,
                brand: {
                    id: row.brand_id,
                    name: '',
                    image: '',
                    websiteUrl: '',
                    status: BrandStatus.ACTIVE, // Avoid tslint checks
                    description: ''
                },
                price: row.price,
                url: row.url,
            },
            interaction: row.interaction,
            date: row.date,
            count: row.count,
        }));
    }

    async addProductInteraction(productId: string, interaction: ProductInteractionEnum): Promise<void> {
        const query = 'INSERT INTO ProductInteractions (product_id, interaction) VALUES ($1, $2)';
        await this.executeQuery(query, [productId, interaction]);
    }

    async addListOfProductInteractions(productIds: string[], interaction: ProductInteractionEnum): Promise<void> {
        if (!productIds || productIds.length === 0) return;

        const query = 'INSERT INTO ProductInteractions (product_id, interaction) VALUES ';
        const values = productIds.map((_, index) => `($${index * 2 + 1}, $${index * 2 + 2})`).join(',');
        const params = productIds.flatMap(productId => [productId, interaction]);

        await this.executeQuery(query + values, params);
    }

    async syncProductMetricsAggDaily(): Promise<void> {
        const query = `
            WITH last_updated AS (
                SELECT COALESCE(MAX(last_updated), TO_DATE('1970-01-01', 'YYYY-MM-DD')) AS last_updated
                FROM ProductMetricsAggDaily
            )
            INSERT INTO ProductMetricsAggDaily (product_id, interaction, date, count, last_updated)
            SELECT
                product_id,
                interaction,
                created_at::DATE AS date,
                COUNT(DISTINCT id) AS count,
                NOW() AS last_updated
            FROM ProductInteractions
            WHERE created_at > (SELECT last_updated FROM last_updated)
            GROUP BY product_id, interaction, date;
        `;

        await this.executeQuery(query, []);
    }

    async getProductMetricsBetweenDates(startDate: string, endDate: string, productId: string): Promise<IProductMetricAggDaily[]> {
        const query = `
            SELECT metrics.product_id, metrics.interaction, metrics.date, metrics.count,
                   p.brand_id as brandId, p.description, p.name, p.images, p.url, p.price, p.status
            FROM products p JOIN (
                SELECT product_id, interaction, date, SUM(count) as count
                FROM ProductMetricsAggDaily
                WHERE product_id = $1 AND date BETWEEN $2 AND $3
                GROUP BY date, product_id, interaction
            ) as metrics
                                 ON metrics.product_id = p.id;
        `;

        const rows = await this.fetchMetrics(query, [productId, startDate, endDate]);
        return this.mapProductMetrics(rows);
    }

    async getMetricsBetweenDates(startDate: string, endDate: string,brandId?:string): Promise<IMetrics[]> {
        let query;
        let values = [startDate, endDate];
        if(brandId){
            query = `
                SELECT interaction, SUM(count) as count
                FROM ProductMetricsAggDaily JOIN public.products p on ProductMetricsAggDaily.product_id = p.id
                WHERE p.brand_id = $3 AND (date BETWEEN $1 AND $2)
                GROUP BY interaction;
            `;
            values.push(brandId)
        }else {
            query = `
                SELECT interaction, SUM(count) as count
                FROM ProductMetricsAggDaily
                WHERE date BETWEEN $1 AND $2
                GROUP BY interaction;
            `;
        }

        const rows = await this.fetchMetrics(query, values);
        return rows.map(row => ({
            interaction: row.interaction,
            count: row.count,
        }));
    }

    async getMetricsBetweenDatesAggDaily(startDate: string, endDate: string, brandId?:string): Promise<IMetrics[]> {
        let query;
        let values = [startDate, endDate];
        if(brandId){
            query = `
                SELECT interaction, date, SUM(count) as count
                FROM ProductMetricsAggDaily JOIN public.products p on ProductMetricsAggDaily.product_id = p.id
                WHERE p.brand_id = $3 AND (date BETWEEN $1 AND $2)
                GROUP BY date, interaction;
            `;
            values.push(brandId)
        }else {
            query = `
                SELECT interaction, date, SUM(count) as count
                FROM ProductMetricsAggDaily
                WHERE date BETWEEN $1 AND $2
                GROUP BY date, interaction;
            `;
        }

        const rows = await this.fetchMetrics(query, values);
        return rows.map(row => ({
            interaction: row.interaction,
            date: row.date,
            count: row.count,
        }));
    }

    async getMetricByProduct(startDate: string, endDate: string, brandId?: string): Promise<IProductMetric[]> {
        let query = `
            SELECT metrics.product_id, metrics.interaction, metrics.count,
                   p.brand_id as brandId, p.description, p.name, p.images, p.url, p.price, p.status
            FROM products p
                     JOIN (
                SELECT product_id, interaction, SUM(count) as count
                FROM ProductMetricsAggDaily
                WHERE date BETWEEN $1 AND $2
                GROUP BY product_id, interaction
            ) as metrics
                          ON metrics.product_id = p.id
        `;

        const params = [startDate, endDate];
        if (brandId) {
            query += ' WHERE p.brand_id = $3';
            params.push(brandId);
        }

        const rows = await this.fetchMetrics(query, params);
        return this.mapProductMetrics(rows);
    }

}

export const productsInteractionsRepository = new ProductsInteractionsRepository(pool);
