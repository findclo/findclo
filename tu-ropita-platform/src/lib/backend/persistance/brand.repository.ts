import pool from "@/lib/backend/conf/db.connections";
import { IBrandDto } from "@/lib/backend/dtos/brand.dto.interface";
import { BrandAlreadyExistsException } from "@/lib/backend/exceptions/brandAlreadyExists.exception";
import { BrandNotFoundException } from "@/lib/backend/exceptions/brandNotFound.exception";
import { BrandStatus, IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { Pool } from "pg";
import { NotFoundException } from "../exceptions/NotFoundException";

export interface IBrandRepository {
    getBrandById(brandId:number): Promise<IBrand | null>;
    listBrands():Promise<IBrand[]>;
    createBrand(brand: IBrandDto): Promise<IBrand>;
    updateBrand(id: number,brand: IBrandDto): Promise<IBrand>;
    deleteBrand(id: number): Promise<boolean>;
    changeBrandStatus(id: number, status: BrandStatus): Promise<boolean>;
    getBrandOwnersIds(brandId: number): Promise<number[]>;
    getBrandsOfUser(userId: number): Promise<IBrand[]>;
}

class BrandRepository implements IBrandRepository {
    constructor(private readonly db: Pool) {}

    private mapBrandRow(row: any): IBrand {
        return {
            id: row.id,
            name: row.name,
            image: row.image,
            websiteUrl: row.websiteurl,
            description: row.description,
            status: row.status,
        };
    }



    async getBrandById(brandId: number): Promise<IBrand | null> {
        const query = `SELECT * FROM Brands WHERE id = $1;`;
        const res = await this.db.query(query, [brandId]);
        if (res.rowCount == null || res.rowCount <= 0){
            return null;
        }
        return this.mapBrandRow(res.rows[0]);
    }

    async listBrands(): Promise<IBrand[]> {
        const query = `SELECT * FROM Brands;`;
        const res = await this.db.query(query);
        return res.rows.map(this.mapBrandRow);
    }

    async createBrand(brand: IBrandDto): Promise<IBrand> {
        const query =
            `INSERT INTO Brands (name, image, websiteUrl, description)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const values = [brand.name, brand.image, brand.websiteUrl, brand.description];

        return this.upsertBrand(query,values,brand, -1);
    }

    async updateBrand(id: number, brand: IBrandDto): Promise<IBrand> {
        const query = `
        UPDATE Brands
        SET name = $1, image = $2, websiteUrl = $3, description = $4
        WHERE id = $5
        RETURNING *`;
        const values = [brand.name, brand.image, brand.websiteUrl, brand.description, id];

        return this.upsertBrand(query, values, brand, id);
    }

    async deleteBrand(id: number): Promise<boolean> {
        const query = `DELETE FROM Brands WHERE id = $1`;
        const values = [id];

        try {
            const res = await this.db.query(query, values);
            return res.rowCount!= null? res.rowCount > 0: false;
        } catch (error: any) {
            console.log(error); // No need to raise error.
            return false;
        }
    }

    async changeBrandStatus(id: number, status: BrandStatus): Promise<boolean>{
        const query = `
        UPDATE Brands
        SET status = $1
        WHERE id = $2
        RETURNING *`;
        const values = [status,id];
        const result = await this.db.query(query, values);
        if (result.rowCount == null || result.rowCount <= 0){
            throw new BrandNotFoundException(id);
        }
        return  result.rowCount > 0;
    }

    async getBrandOwnersIds(brandId: number): Promise<number[]> {
        const query = `SELECT user_id FROM user_brands WHERE brand_id = $1;`;
        const res = await this.db.query(query, [brandId]);
        return res.rows.map((row: any) => row.user_id);
    }

    async getBrandsOfUser(userId: number): Promise<IBrand[]> {
        const query = `
            SELECT b.* 
            FROM Brands b
            JOIN user_brands ub ON b.id = ub.brand_id
            WHERE ub.user_id = $1;
        `;
        const values = [userId];
        
        try {
            const res = await this.db.query(query, values);
            if (res.rowCount === 0) {
                throw NotFoundException.createFromMessage(`No brand found for user. [user_id:${userId}]`);
            }
            return res.rows.map(this.mapBrandRow);
        } catch (error) {
            console.error('Error fetching brands of user:', error);
            throw error;
        }
    }

    private async upsertBrand(query: string, values: any[], brand: IBrandDto, brandId: number) {
        try {
            const res = await this.db.query(query, values);
            if (res.rowCount == null || res.rowCount <= 0){
                throw new BrandNotFoundException(brandId);
            }
            return this.mapBrandRow(res.rows[0]);
        } catch (error: any) {

            if (error.code === '23505') {
                throw new BrandAlreadyExistsException(brand.name);
            }
            console.log(error)
            throw error;
        }
    }
}

export const brandRepository : IBrandRepository = new BrandRepository(pool);