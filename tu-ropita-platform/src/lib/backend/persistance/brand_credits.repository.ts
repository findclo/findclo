import { Pool } from "pg";
import pool from "../conf/db.connections";
import { IBrandCredits } from "../models/interfaces/IBrandCredits";

class BrandCreditsRepository {

    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    async getBrandCredits(brandId: number): Promise<IBrandCredits | null> {
        const query_result = await this.db.query('SELECT * FROM brand_credits WHERE brand_id = $1', [brandId]);
        if (query_result.rowCount === 0) {
            return null;
        }
        return query_result.rows[0] as IBrandCredits;
    }

    async addBrandCredits(brandId: number, credits: number): Promise<IBrandCredits> {
        const brandCredits = await this.getBrandCredits(brandId);
        if(!brandCredits){
            const query_result = await this.db.query('INSERT INTO brand_credits (brand_id, credits_available) VALUES ($1, $2) RETURNING *', [brandId, credits]);
            if (query_result.rowCount === 0) {
                throw new Error('Failed to create brand credits');
            }
            return query_result.rows[0] as IBrandCredits;
        }
        const query_result = await this.db.query('UPDATE brand_credits SET credits_available = credits_available + $1 WHERE brand_id = $2 RETURNING *', [credits, brandId]);
        if (query_result.rowCount === 0) {
            throw new Error('Failed to update brand credits');
        }
        return query_result.rows[0] as IBrandCredits;
    }

    async spendBrandCredits(brandId: number, credits: number): Promise<IBrandCredits> {
        const brandCredits = await this.getBrandCredits(brandId);
        if(!brandCredits){
            throw new Error('Brand credits not found');
        }
        const query_result = await this.db.query('UPDATE brand_credits SET credits_spent = credits_spent + $1 WHERE brand_id = $2 RETURNING *', [credits, brandId]);
        if (query_result.rowCount === 0) {
            throw new Error('Failed to update brand credits');
        }
        return query_result.rows[0] as IBrandCredits;
    }

}

export const brandCreditsRepository = new BrandCreditsRepository(pool);