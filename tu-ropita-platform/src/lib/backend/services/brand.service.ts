import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandRepository, IBrandRepository } from "@/lib/backend/persistance/brand.repository";

export interface IBrandService {
    getBrandById(brandId:number): Promise<IBrand>;
    listBrands():Promise<IBrand[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class BrandService implements IBrandService {
    private repository: IBrandRepository;

    constructor(repository: IBrandRepository) {
        this.repository = repository;
    }

    getBrandById(brandId: number): Promise<IBrand> {
        return this.repository.getBrandById(brandId);
    }

    listBrands(): Promise<IBrand[]> {
        return this.repository.listBrands();
    }

}

export const brandService : IBrandService = new BrandService(brandRepository);