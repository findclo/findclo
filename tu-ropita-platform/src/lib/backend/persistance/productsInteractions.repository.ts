import { ProductInteractionEnum } from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";
import { Pool } from "pg";
import pool from "@/lib/backend/conf/db.connections";
import { IProductMetricAggDaily } from "@/lib/backend/models/interfaces/metrics/product.metric.aggDaily.interface";
import { IMetrics } from "@/lib/backend/models/interfaces/metrics/metric.interface";
import { IProductMetric } from "@/lib/backend/models/interfaces/metrics/product.metric.interface";

export interface IProductsInteractionsRepository {
    addProductInteraction(productId: string, interaction: ProductInteractionEnum): Promise<void>;
    addListOfProductInteractions(productIds: string[], interaction: ProductInteractionEnum): Promise<void>;
    syncProductMetricsAggDaily(): Promise<void>;
    getProductMetricsBetweenDates(startDate: string, endDate: string, productId: string): Promise<IProductMetricAggDaily[]>;
    getMetricsBetweenDates(startDate: string, endDate: string): Promise<IMetrics[]>;
    getMetricByProduct(startDate: string, endDate: string): Promise<IProductMetric[]>
}

class ProductsInteractionsRepository implements IProductsInteractionsRepository {
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
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
            SELECT product_id, interaction, date, SUM(count) as count
            FROM ProductMetricsAggDaily
            WHERE product_id = $1 AND date BETWEEN $2 AND $3
            GROUP BY date, product_id, interaction;
        `;

        const rows = await this.fetchMetrics(query, [productId, startDate, endDate]);

        return rows.map(row => ({
            productId: row.product_id,
            interaction: row.interaction,
            date: row.date,
            count: row.count,
        }));
    }

    async getMetricsBetweenDates(startDate: string, endDate: string): Promise<IMetrics[]> {
        const query = `
            SELECT interaction, SUM(count) as count
            FROM ProductMetricsAggDaily
            WHERE date BETWEEN $1 AND $2
            GROUP BY interaction;
        `;

        const rows = await this.fetchMetrics(query, [startDate, endDate]);

        return rows.map(row => ({
            interaction: row.interaction,
            count: row.count,
        }));
    }

    async getMetricsBetweenDatesAggDaily(startDate: string, endDate: string): Promise<IMetrics[]> {
        const query = `
            SELECT interaction, date, SUM(count) as count
            FROM ProductMetricsAggDaily
            WHERE date BETWEEN $1 AND $2
            GROUP BY date, interaction;
        `;

        const rows = await this.fetchMetrics(query, [startDate, endDate]);

        return rows.map(row => ({
            interaction: row.interaction,
            date: row.date,
            count: row.count,
        }));
    }

    async getMetricByProduct(startDate: string, endDate: string): Promise<IProductMetric[]> {
        const query = `
            SELECT product_id, interaction, SUM(count) as count
            FROM ProductMetricsAggDaily
            WHERE date BETWEEN $1 AND $2
            GROUP BY product_id, interaction;
        `;

        const rows = await this.fetchMetrics(query, [startDate, endDate]);

        return rows.map(row => ({
            productId: row.product_id,
            interaction: row.interaction,
            count: row.count,
        }));
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
}

export const productsInteractionsRepository = new ProductsInteractionsRepository(pool);
