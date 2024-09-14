import pool from "@/lib/backend/conf/db.connections";
import { BrandNotFoundException } from "@/lib/backend/exceptions/brandNotFound.exception";
import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { Pool } from "pg";

export interface IBrandRepository {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
}

export const brandRepository : IBrandRepository = new BrandRepository(pool);