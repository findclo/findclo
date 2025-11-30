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
    detectBrandsInQuery(searchQuery: string): Promise<Array<{ brand: IBrand; similarity: number; isExact: boolean }>>;
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

    async detectBrandsInQuery(searchQuery: string): Promise<Array<{ brand: IBrand; similarity: number; isExact: boolean }>> {
        if (!searchQuery || searchQuery.trim().length === 0) {
            return [];
        }

        // First try exact match
        const exactMatch = await brandRepository.findBrandByExactMatch(searchQuery);
        if (exactMatch) {
            console.log(`[Brand Detection] Exact match found: ${exactMatch.name}`);
            return [{
                brand: exactMatch,
                similarity: 1.0,
                isExact: true
            }];
        }

        // Try fuzzy matching
        const fuzzyMatches = await brandRepository.findBrandsByFuzzyMatch(searchQuery, 0.3);

        if (fuzzyMatches.length > 0) {
            console.log(`[Brand Detection] Fuzzy matches found: ${fuzzyMatches.map(m => `${m.brand.name}(${m.similarity.toFixed(2)})`).join(', ')}`);
        }

        return fuzzyMatches.map(match => ({
            brand: match.brand,
            similarity: match.similarity,
            isExact: false
        }));
    }

}

export const brandService : IBrandService = new BrandService();