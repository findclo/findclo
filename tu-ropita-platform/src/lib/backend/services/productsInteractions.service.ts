import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/productInteraction.interface";
import {productsInteractionsRepository} from "@/lib/backend/persistance/productsInteractions.repository";

export interface IProductsInteractionsService {
    // Single product interactions
    addProductClickInteraction(productId: string): Promise<void>;
    addProductViewInListingRelatedInteraction(productId: string): Promise<void>;
    addProductViewInListingPromotedInteraction(productId: string): Promise<void>;
    addProductNavigateToBrandSiteInteraction(productId: string): Promise<void>;

    // Many products interactions
    addListOfProductViewInListingRelatedInteraction(productIds: string[]): Promise<void>;


}

class ProductsInteractionsService implements IProductsInteractionsService {

    private async addProductInteraction(productId: string, interaction: ProductInteractionEnum): Promise<void> {
        return productsInteractionsRepository.addProductInteraction(productId, interaction);
    }

    public async addProductClickInteraction(productId: string): Promise<void> {
        return this.addProductInteraction(productId, ProductInteractionEnum.CLICK);
    }

    public async addProductViewInListingRelatedInteraction(productId: string): Promise<void> {
        return this.addProductInteraction(productId, ProductInteractionEnum.VIEW_IN_LISTING_RELATED);
    }

    public async addProductViewInListingPromotedInteraction(productId: string): Promise<void> {
        return this.addProductInteraction(productId, ProductInteractionEnum.VIEW_IN_LISTING_PROMOTED);
    }

    public async addProductNavigateToBrandSiteInteraction(productId: string): Promise<void> {
        return this.addProductInteraction(productId, ProductInteractionEnum.NAVIGATE_TO_BRAND_SITE);
    }

    public async addListOfProductViewInListingRelatedInteraction(productIds: string[]): Promise<void> {
        return productsInteractionsRepository.addListOfProductInteractions(productIds, ProductInteractionEnum.VIEW_IN_LISTING_RELATED);
    }
}

export const productsInteractionsService = new ProductsInteractionsService();