import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export interface IProductCSVUploadParser {
    parse(file:File): Promise<IProduct[]>;
}