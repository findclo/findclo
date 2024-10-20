export enum BrandStatus {
    ACTIVE= 'ACTIVE',
    PAUSED='PAUSED',
    DUE_PAYMENT= 'DUE_PAYMENT'
}

export interface IBrand {
    id: number;
    name: string;
    image: string;
    websiteUrl:string;
    description: string;
    status: BrandStatus;
}
