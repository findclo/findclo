import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";

export interface IProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    images: string[];
    status?: "ACTIVE" | "PAUSED" | "PAUSED_BY_ADMIN" | "DELETED";
    brand: IBrand;
    url: string;
};