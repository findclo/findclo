import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";

export interface IBrandRepository {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
}