export interface IAttribute {
    id: number;
    name: string;
    slug: string;
    created_at: Date;
    updated_at: Date;
}

export interface IAttributeValue {
    id: number;
    attribute_id: number;
    value: string;
    slug: string;
    created_at: Date;
    updated_at: Date;
}

export interface IAttributeWithValues extends IAttribute {
    values: IAttributeValue[];
}

export interface IProductAttribute {
    id: number;
    product_id: number;
    attribute_id: number;
    attribute_value_id: number;
    created_at: Date;
}

// Para queries complejas que retornan datos denormalizados
export interface IProductAttributeDetail {
    attribute_id: number;
    attribute_name: string;
    attribute_slug: string;
    value_id: number;
    value: string;
    value_slug: string;
}
