import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";

export interface IProduct {
    id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    brand: IBrand;
};