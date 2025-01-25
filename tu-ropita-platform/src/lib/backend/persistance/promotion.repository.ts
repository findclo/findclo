import { Pool } from "pg";
import pool from "../conf/db.connections";
import { IPromotion, IPromotionAdmin } from "../models/interfaces/IPromotion";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {BrandStatus} from "@/lib/backend/models/interfaces/brand.interface";

class PromotionRepository {

    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async createPromotion(promotion: IPromotion): Promise<IPromotion> {
        if(!promotion.keywords){
            promotion.keywords = [];
        }
        const query_result = await this.db.query('INSERT INTO promotions (product_id, keywords, credits_allocated, show_on_landing) VALUES ($1, $2, $3, $4) RETURNING *', [promotion.product_id, promotion.keywords, promotion.credits_allocated, promotion.show_on_landing]);
        if (query_result.rowCount === 0) {
            throw new Error('Failed to create promotion');
        }
        return query_result.rows[0] as IPromotion;
    }

    async getPromotionById(promotionId: number): Promise<IPromotionAdmin> {
        const query_result = await this.db.query('SELECT * FROM promotions WHERE id = $1', [promotionId]);
        if (query_result.rowCount === 0) {
            throw new Error('Promotion not found');
        }
        return query_result.rows[0] as IPromotionAdmin;
    }

    async getPromotionsByBrandId(brandId: number, activeOnly: boolean = true): Promise<IPromotion[]> {
        const query_result = await this.db.query(
            `SELECT 
                promotions.id as id,
                promotions.product_id,
                promotions.keywords,
                promotions.credits_allocated,
                promotions.credits_spent,
                promotions.show_on_landing,
                promotions.is_active
            FROM promotions 
            INNER JOIN products ON promotions.product_id = products.id 
            WHERE products.brand_id = $1 ${activeOnly ? 'AND promotions.is_active = true' : ''}`, 
            [brandId]
        );
        if (query_result.rowCount === 0) {
            return [];
        }
        return query_result.rows as IPromotion[];
    }

    async getActivePromotions(forLandingPage: boolean = false): Promise<IPromotion[]> {
        let query = 'SELECT * FROM promotions WHERE is_active = true';
        if(forLandingPage){
            query += ' AND show_on_landing = true';
        }
        const query_result = await this.db.query(query);
        if (query_result.rowCount === 0) {
            return [];
        }
        return query_result.rows as IPromotion[];
    }

    async hasPromotionForProduct(productId: number): Promise<boolean> {
        const query_result = await this.db.query('SELECT * FROM promotions WHERE product_id = $1 AND is_active = true', [productId]);
        if(query_result.rowCount === 0){
            return false;
        }
        return true;
    }

    async stopPromotion(promotionId: number): Promise<void> {
        const query_result = await this.db.query('UPDATE promotions SET is_active = false WHERE id = $1', [promotionId]);
        if(query_result.rowCount === 0){
            throw new Error('Failed to stop promotion');
        }
    }

    async spendProductPromotionsCredits(product_ids: number[]): Promise<void> {
        const query_result = await this.db.query('UPDATE promotions SET credits_spent = credits_spent + 1 WHERE product_id = ANY($1) AND is_active = true', [product_ids]);
        if(query_result.rowCount === 0){
            throw new Error('Failed to spend products promotion credits');
        }
    }

    async getProductsByKeywords(keywords: string[]): Promise<IProduct[]> {
        const query_result = await this.db.query(
            `SELECT DISTINCT prod.*
             FROM promotions prom
                      JOIN products prod ON prom.product_id = prod.id
             WHERE EXISTS (SELECT 1
                           FROM unnest(prom.keywords) AS keyword
                           WHERE keyword = ANY ($1))
               AND prod.status = 'ACTIVE'`,
            [keywords]
        );

        if (query_result.rowCount === 0) {
            return [];
        }
        return query_result.rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price),
            description: row.description,
            images: row.images && row.images.length > 0 ? row.images : [],
            status: row.status,
            url: row.url,
            brand: {
                id: row.brand_id,
                name: '',
                image: '',
                websiteUrl: '',
                status: BrandStatus.ACTIVE, // this is to avoid tslint checks
                description: ''
            }
        }));
    }

}

export const promotionRepository = new PromotionRepository(pool);  