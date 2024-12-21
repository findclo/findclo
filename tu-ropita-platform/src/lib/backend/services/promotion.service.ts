import { NotFoundException } from "../exceptions/NotFoundException";
import { IPromotion } from "../models/interfaces/IPromotion";
import { IProduct } from "../models/interfaces/product.interface";
import { productRepository } from "../persistance/products.repository";
import { promotionRepository } from "../persistance/promotion.repository";


class PromotionService {

    async createPromotion(promotion: IPromotion): Promise<IPromotion> {
        return promotionRepository.createPromotion(promotion);
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

}

export const promotionService = new PromotionService();
