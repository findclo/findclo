import pool from "@/lib/backend/conf/db.connections";
import { BrandNotFoundException } from "@/lib/backend/exceptions/brandNotFound.exception";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { Pool } from "pg";
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";
import {BrandAlreadyExistsException} from "@/lib/backend/exceptions/brandAlreadyExists.exception";

export interface IBrandRepository {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
    createBrand(brand: IBrandDto): Promise<IBrand>;
    updateBrand(id: number,brand: IBrandDto): Promise<IBrand>;
}

class BrandRepository implements IBrandRepository {
    constructor(private readonly db: Pool) {}

    private mapBrandRow(b: any): IBrand {
        return {
            id: b.id,
            name: b.name,
            image: b.image,
            websiteUrl: b.websiteurl,
        };
    }

    async getBrandById(brandId: number): Promise<IBrand> {
        const query = `SELECT * FROM Brands WHERE id = $1;`;
        const res = await this.db.query(query, [brandId]);
        if (res.rowCount == null || res.rowCount <= 0){
            throw new BrandNotFoundException(brandId);
        }
        console.log(res)
        return this.mapBrandRow(res.rows[0]);
    }

    async listBrands(): Promise<IBrand[]> {
        const query = `SELECT * FROM Brands;`;
        const res = await this.db.query(query);
        return res.rows.map(this.mapBrandRow);
    }

    async createBrand(brand: IBrandDto): Promise<IBrand> {
        const query =
            `INSERT INTO Brands (name, image, websiteUrl)
            VALUES ($1, $2, $3)
            RETURNING *`;
        const values = [brand.name, brand.image, brand.websiteUrl];

        return this.upsertBrand(query,values,brand);
    }

    async updateBrand(id: number, brand: IBrandDto): Promise<IBrand> {
        const query = `
        UPDATE Brands
        SET name = $1, image = $2, websiteUrl = $3
        WHERE id = $4
        RETURNING *`;
        const values = [brand.name, brand.image, brand.websiteUrl, id];

        return this.upsertBrand(query, values, brand);
    }

    private async upsertBrand(query: string, values: any[], brand: IBrandDto) {
        try {
            const res = await this.db.query(query, values);
            return res.rows[0];
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