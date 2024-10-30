import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/productInteraction.interface";

export interface IProductMetricAggDaily {
    id: string;
    productId: string;
    interaction: ProductInteractionEnum;
    date: Date;
    count: number;
    lastUpdated: Date;
}