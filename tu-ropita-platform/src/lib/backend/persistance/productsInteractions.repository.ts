import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/productInteraction.interface";
import {Pool} from "pg";
import pool from "@/lib/backend/conf/db.connections";

export interface IProductsInteractionsRepository {
    addProductInteraction(productId: string, interaction: ProductInteractionEnum): Promise<void>;

    addListOfProductInteractions(productIds: string[], interaction: ProductInteractionEnum): Promise<void>;
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


}

export const productsInteractionsRepository = new ProductsInteractionsRepository(pool);