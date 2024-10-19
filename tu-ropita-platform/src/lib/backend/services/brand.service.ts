import {BrandStatus, IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import { brandRepository } from "@/lib/backend/persistance/brand.repository";
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";
import {BrandNotFoundException} from "@/lib/backend/exceptions/brandNotFound.exception";
import {BadRequestException} from "@/lib/backend/exceptions/BadRequestException";

export interface IBrandService {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
    createBrand(brand:IBrandDto): Promise<IBrand>;
    updateBrand(id: number, brand:IBrandDto): Promise<IBrand>;
    deleteBrand(id: number): Promise<boolean>;
    changeBrandStatus(id: number, status: string): Promise<IBrand>;
}

class BrandService implements IBrandService {

    async getBrandById(brandId: number): Promise<IBrand> {
        const brand = await brandRepository.getBrandById(brandId);
        if (brand == null){
            throw new BrandNotFoundException(brandId);
        }
        return brand;
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

    async changeBrandStatus(id: number, status: string): Promise<IBrand> {
        const statusEnum = BrandStatus[status as keyof typeof BrandStatus];
        if (!statusEnum) {
            throw new BadRequestException(`Invalid status: ${status} please use one of ${Object.keys(BrandStatus).join(', ')}`);
        }
        const changed =  await brandRepository.changeBrandStatus(id,statusEnum);
        if (changed){
            return this.getBrandById(id);
        }
        throw new Error('Failed to change brand status');
    }

}

export const brandService : IBrandService = new BrandService();