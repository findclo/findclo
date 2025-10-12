import { AttributeType } from "@/lib/backend/models/interfaces/attribute.interface";

// ========== ATTRIBUTE DTOs ==========

export interface IAttributeCreateDTO {
    name: string;
    type: AttributeType;
    filterable?: boolean;
    visible_in_ui?: boolean;
    sort_order?: number;
}

// ========== ATTRIBUTE VALUE DTOs ==========

export interface IAttributeValueCreateDTO {
    value: string;
    sort_order?: number;
}

// ========== PRODUCT ATTRIBUTES DTOs ==========

export interface IProductAttributeAssignment {
    attribute_id: number;
    value_ids: number[];  // Permite múltiples valores para multiselect
}

export interface IProductAttributesAssignDTO {
    attributes: IProductAttributeAssignment[];
}

// ========== FILTER DTOs ==========

export interface IAttributeFilterDTO {
    [attributeSlug: string]: string[];  // attribute slug -> array of value slugs
}
// Ejemplo: { "color": ["rojo", "azul"], "talla": ["m", "l"] }
