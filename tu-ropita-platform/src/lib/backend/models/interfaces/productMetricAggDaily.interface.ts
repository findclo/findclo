import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/productInteraction.interface";

export interface IProductMetricAggDaily {
    productId: string;
    interaction: ProductInteractionEnum;
    date: Date;
    count: number;
}