import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export interface IAttributeValueCount {
    value_id: number;
    value: string;
    value_slug: string;
    count: number;
}

export interface IAttributeFilterMap {
    attribute_id: number;
    attribute_name: string;
    attribute_slug: string;
    values: IAttributeValueCount[];
}

export interface IListProductResponseDto {
    products : IProduct[];
    pageNum: number;
    totalPages: number;
    pageSize: number;
    attributes?: IAttributeFilterMap[];
}