import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export interface IProductMetric {
    product: IProduct;
    interaction: ProductInteractionEnum;
    count: number;
}