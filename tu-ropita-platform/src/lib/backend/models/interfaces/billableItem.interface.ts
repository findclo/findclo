import {ProductInteractionEnum} from "@/lib/backend/models/interfaces/metrics/productInteraction.interface";

export interface IBillableItem {
    name: ProductInteractionEnum;
    price: number;
}