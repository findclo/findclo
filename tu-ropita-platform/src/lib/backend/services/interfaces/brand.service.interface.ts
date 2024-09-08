import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";

export interface IBrandService {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
}