import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/productInteraction.interface";
import {productsInteractionsRepository} from "@/lib/backend/persistance/productsInteractions.repository";
import {IProductMetricAggDaily} from "@/lib/backend/models/interfaces/productMetricAggDaily.interface";
import {IMetrics} from "@/lib/backend/models/metric.interface";
import {formatDateYYYYMMDD} from "@/lib/utils";

export interface IProductsInteractionsService {
    // Single product interactions
    addProductClickInteraction(productId: string): Promise<void>;
    addProductViewInListingRelatedInteraction(productId: string): Promise<void>;
    addProductViewInListingPromotedInteraction(productId: string): Promise<void>;
    addProductNavigateToBrandSiteInteraction(productId: string): Promise<void>;

    // Many products interactions
    addListOfProductViewInListingRelatedInteraction(productIds: string[]): Promise<void>;

    // AggDaily metrics
    syncProductMetricsAggDaily(): Promise<void>;
    getProductMetricsBetweenDates(startDate: Date, endDate: Date, productId : string): Promise<IProductMetricAggDaily[]>
    getMetricsBetweenDates(startDate: Date, endDate: Date): Promise<IMetrics[]>;
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

    public async syncProductMetricsAggDaily(): Promise<void> {
        return productsInteractionsRepository.syncProductMetricsAggDaily();
    }

    public async getProductMetricsBetweenDates(startDate: Date, endDate: Date, productId : string): Promise<IProductMetricAggDaily[]> {
        return productsInteractionsRepository.getProductMetricsBetweenDates(formatDateYYYYMMDD(startDate), formatDateYYYYMMDD(endDate), productId);
    }

    public async getMetricsBetweenDates(startDate: Date, endDate: Date): Promise<IMetrics[]> {
        return productsInteractionsRepository.getMetricsBetweenDates(formatDateYYYYMMDD(startDate), formatDateYYYYMMDD(endDate));
    }

    public async getMetricsBetweenDatesAggDaily(startDate: Date, endDate: Date): Promise<IMetrics[]> {
        return productsInteractionsRepository.getMetricsBetweenDatesAggDaily(formatDateYYYYMMDD(startDate), formatDateYYYYMMDD(endDate));
    }
}

export const productsInteractionsService = new ProductsInteractionsService();