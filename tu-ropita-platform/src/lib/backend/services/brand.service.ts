import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandRepository } from "@/lib/backend/persistance/brand.repository";

export interface IBrandService {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class BrandService implements IBrandService {

    getBrandById(brandId: number): Promise<IBrand> {
        return brandRepository.getBrandById(brandId);
    }

    listBrands(): Promise<IBrand[]> {
        return brandRepository.listBrands();
    }

}

export const brandService : IBrandService = new BrandService();