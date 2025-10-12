// ========== ATTRIBUTE DTOs ==========

export interface IAttributeCreateDTO {
    name: string;
}

// ========== ATTRIBUTE VALUE DTOs ==========

export interface IAttributeValueCreateDTO {
    value: string;
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
