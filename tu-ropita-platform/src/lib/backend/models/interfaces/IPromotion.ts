
export interface IPromotion {
    product_id: number;
    credits_allocated: number;
    show_on_landing: boolean;
    keywords?: string[];
    is_active?: boolean;
}

export interface IPromotionAdmin {
    product_id: number;
    keywords: string[];
    credits_allocated: number;
    credits_spent: number;
    credits_per_view: number;
    show_on_landing: boolean;
    is_active: boolean;
}