import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { ICategory } from "@/lib/backend/models/interfaces/category.interface";

export interface IProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    images: string[];
    status?: "ACTIVE" | "PAUSED" | "PAUSED_BY_ADMIN" | "DELETED";
    brand: IBrand;
    url: string;
    categories?: ICategory[];
};