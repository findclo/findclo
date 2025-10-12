export interface IProductDTO {
    name: string;
    price: number;
    description: string;
    images: string[];
    url: string;
    category_ids?: number[];
}