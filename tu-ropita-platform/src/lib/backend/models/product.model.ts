import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";

export class ProductImpl implements IProduct {
    id: string | number;
    name: string;
    price: number;
    description: string;
    images: string[];
    brand: IBrand;

    constructor(
        id: string | number,
        name: string,
        price: number,
        description: string,
        images: string[],
        brand: IBrand
    ) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.description = description;
        this.images = images;
        this.brand = brand;
    }

    // You can add methods here as needed, for example:
    displayInfo(): string {
        return `${this.name} by ${this.brand.name} costs $${this.price}.`;
    }
}