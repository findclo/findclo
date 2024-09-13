
export interface IProductsTagsService {
    tagPendingProducts(): Promise<void>;
    tagProductByCategoryName(tags: string[], categoryName : string ,productId: string): Promise<void>;
}