import { NotFoundException } from "../exceptions/NotFoundException";
import { IBrandCredits } from "../models/interfaces/IBrandCredits";
import { brandCreditsRepository } from "../persistance/brand_credits.repository";

class BrandCreditsService {

    async addBrandCredits(brandId: number, credits: number): Promise<IBrandCredits> {
        return brandCreditsRepository.addBrandCredits(brandId, credits);
    }

    async getBrandCredits(brandId: number): Promise<IBrandCredits> {
        const brandCredits = await brandCreditsRepository.getBrandCredits(brandId);
        if(!brandCredits){
            throw NotFoundException.createFromMessage(`Brand credits not found for brand. [brand_id: ${brandId}]`);
        }
        return brandCredits;
    }

    async spendBrandCredits(brandId: number, credits: number): Promise<IBrandCredits> {
        return brandCreditsRepository.spendBrandCredits(brandId, credits);
    }

    async removeBrandCredits(brandId: number, credits: number): Promise<IBrandCredits> {
        return brandCreditsRepository.removeBrandCredits(brandId, credits);
    }
}

export const brandCreditsService = new BrandCreditsService();