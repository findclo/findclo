import { NotFoundException } from "../exceptions/NotFoundException";
import { IPromotion, IPromotionAdmin } from "../models/interfaces/IPromotion";
import { IProduct } from "../models/interfaces/product.interface";
import { productRepository } from "../persistance/products.repository";
import { promotionRepository } from "../persistance/promotion.repository";


class PromotionService {

    async createPromotion(promotion: IPromotion): Promise<IPromotion> {
        return promotionRepository.createPromotion(promotion);
    }

    async getPromotionById(promotionId: number): Promise<IPromotionAdmin> {
        const promotion = await promotionRepository.getPromotionById(promotionId);
        if(!promotion) {
            throw NotFoundException.createFromMessage(`Promotion not found. [promotion_id: ${promotionId}]`);
        }
        return promotion;
    }

    async getPromotionsByBrandId(brandId: number): Promise<IPromotion[]> {
        const promotions = await promotionRepository.getPromotionsByBrandId(brandId);
        if (promotions.length === 0) {
            throw NotFoundException.createFromMessage(`No promotions found for brand. [brand_id: ${brandId}]`);
        }
        return promotions;
    }

    async getActivePromotions(forLandingPage: boolean = false): Promise<IPromotion[]> {
        const promotions = await promotionRepository.getActivePromotions(forLandingPage);
        if (promotions.length === 0) {
            throw NotFoundException.createFromMessage(`No active promotions found.`);
        }
        return promotions;
    }

    async getPromotedProducts(promotions?: IPromotion[]): Promise<IProduct[]> {
        const activePromotions = promotions || await this.getActivePromotions();
        const products: IProduct[] = [];
        for (const promotion of activePromotions) {
            const product = await productRepository.getProductById(promotion.product_id, true);
            if (product) {
                products.push(product);
            }
        }
        return products;
    }

    async getPromotedProductsByBrandId(brandId: number): Promise<IProduct[]> {
        const promotions = await this.getPromotionsByBrandId(brandId);
        return this.getPromotedProducts(promotions);
    }

    async hasPromotionForProduct(productId: number): Promise<boolean> {
        return promotionRepository.hasPromotionForProduct(productId);
    }

    async stopPromotion(promotionId: number): Promise<void> {
        return promotionRepository.stopPromotion(promotionId);
    }

    async spendProductPromotionsCredits(product_ids: number[]): Promise<void> {
        return promotionRepository.spendProductPromotionsCredits(product_ids);
    }

}

export const promotionService = new PromotionService();
