import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandRepository } from "@/lib/backend/persistance/brand.repository";
import { IBrandRepository } from "@/lib/backend/persistance/interfaces/brand.repository.interface";
import { IBrandService } from "@/lib/backend/services/interfaces/brand.service.interface";

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