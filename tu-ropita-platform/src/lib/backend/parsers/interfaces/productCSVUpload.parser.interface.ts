import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";

export interface IProductCSVUploadParser {
    parse(file:File): Promise<IProductDTO[]>;
}