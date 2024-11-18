import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";

export interface IProductMetric {
    productId: string;
    interaction: ProductInteractionEnum;
    count: number;
}