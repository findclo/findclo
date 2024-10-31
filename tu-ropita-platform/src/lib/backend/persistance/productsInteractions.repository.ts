import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/productInteraction.interface";
import {Pool} from "pg";
import pool from "@/lib/backend/conf/db.connections";
import {IProductMetricAggDaily} from "@/lib/backend/models/interfaces/productMetricAggDaily.interface";

export interface IProductsInteractionsRepository {
    addProductInteraction(productId: string, interaction: ProductInteractionEnum): Promise<void>;

    addListOfProductInteractions(productIds: string[], interaction: ProductInteractionEnum): Promise<void>;

    syncProductMetricsAggDaily(): Promise<void>;
}

class ProductsInteractionsRepository implements IProductsInteractionsRepository {
    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async addProductInteraction(productId: string, interaction: ProductInteractionEnum): Promise<void> {
        const query: string = 'INSERT INTO ProductInteractions (product_id, interaction) VALUES ($1, $2)';

        try {
            await this.db.query(query, [productId, interaction]);
        } catch (error) {
            console.error('Error adding product interaction:', error);
            throw error;
        }
    }

    async addListOfProductInteractions(productIds: string[], interaction: ProductInteractionEnum): Promise<void> {
        if(!productIds || productIds.length === 0) {
            return ;
        }
        const query: string = 'INSERT INTO ProductInteractions (product_id, interaction) VALUES ';
        const values: string[] = [];
        const params: string[] = [];
        let valuesIdx = 0;

        for (const productId of productIds) {
            values.push(`($${valuesIdx + 1}, $${valuesIdx + 2})`);
            valuesIdx+=2;
            params.push(productId, interaction);
        }

        try {
            await this.db.query(query + values.join(','), params);
        } catch (error) {
            console.error('Error adding list of product interactions:', error);
            throw error;
        }
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

        try {
            await this.db.query(query);
        } catch (error) {
            console.error('Error syncing product metrics:', error);
            throw error;
        }
    }

    async getProductMetricsBetweenDates(startDate: Date, endDate: Date): Promise<IProductMetricAggDaily[]> {
        const query = `
            SELECT product_id, interaction, date, count
            FROM ProductMetricsAggDaily
            WHERE date BETWEEN $1 AND $2
            ORDER BY date, product_id, interaction;
        `;

        try {
            const result = await this.db.query(query, [startDate, endDate]);
            return result.rows.map((row: any) => {
                return {
                    productId: row.product_id,
                    interaction: row.interaction,
                    date: row.date,
                    count: row.count
                }
            });

        } catch (error) {
            console.error('Error fetching product metrics between dates:', error);
            throw error;
        }
    }


}

export const productsInteractionsRepository = new ProductsInteractionsRepository(pool);