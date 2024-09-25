import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandRepository } from "@/lib/backend/persistance/brand.repository";
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";

export interface IBrandService {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
    createBrand(brand:IBrandDto): Promise<IBrand>;
    updateBrand(id: number, brand:IBrandDto): Promise<IBrand>;
    deleteBrand(id: number): Promise<boolean>;
}

class BrandService implements IBrandService {

    getBrandById(brandId: number): Promise<IBrand> {
        return brandRepository.getBrandById(brandId);
    }

    listBrands(): Promise<IBrand[]> {
        return brandRepository.listBrands();
    }

    createBrand(brand: IBrandDto): Promise<IBrand> {
        return brandRepository.createBrand(brand);
    }

    updateBrand(id: number,brand: IBrandDto): Promise<IBrand> {
        return brandRepository.updateBrand(id,brand);
    }

    deleteBrand(id: number): Promise<boolean> {
        return brandRepository.deleteBrand(id);
    }

}

export const brandService : IBrandService = new BrandService();