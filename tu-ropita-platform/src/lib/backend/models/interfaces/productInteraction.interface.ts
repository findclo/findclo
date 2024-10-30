export enum ProductInteractionEnum {
    VIEW_IN_LISTING_RELATED = 'view_in_listing_related',
    VIEW_IN_LISTING_PROMOTED = 'view_in_listing_promoted',
    CLICK = 'click',
    NAVIGATE_TO_BRAND_SITE = 'navigate_to_brand_site'
}

export interface IProductInteraction {
    id: string;
    productId: string;
    interaction: ProductInteractionEnum;
    createdAt: Date;
}