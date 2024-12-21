export interface IPromotionDto {
    product_id: number;
    credits_allocated: number;
    show_on_landing: boolean;
    keywords?: string[];
}