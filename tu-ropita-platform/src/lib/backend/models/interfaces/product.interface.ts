import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";

export interface IProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    images: string[];
    status?: string;
    brand: IBrand;
};