import {
    IAttributeCreateDTO,
    IAttributeValueCreateDTO,
    IProductAttributesAssignDTO,
} from "@/lib/backend/dtos/attribute.dto.interface";
import {
    IAttribute,
    IAttributeValue,
    IAttributeWithValues,
    IProductAttributeDetail
} from "@/lib/backend/models/interfaces/attribute.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

const ATTRIBUTES_PATH = `/attributes`;
const ADMIN_ATTRIBUTES_PATH = `/admin/attributes`;

class PublicAttributesApiWrapper {

    async getAttributes(includeValues: boolean = false): Promise<IAttribute[] | IAttributeWithValues[]> {
        const params = new URLSearchParams();
        if (includeValues) params.set('include_values', 'true');

        const [error, attributes] = await fetcher(`${ATTRIBUTES_PATH}?${params.toString()}`);
        if (error) {
            console.error(`Error fetching attributes: ${error}`);
            throw new Error(`Error fetching attributes: ${error}`);
        }
        return attributes as IAttribute[] | IAttributeWithValues[];
    }

    async getProductAttributes(productId: number): Promise<IProductAttributeDetail[]> {
        const [error, attributes] = await fetcher(`/products/${productId}/attributes`);
        if (error) {
            console.error(`Error fetching product attributes: ${error}`);
            throw new Error(`Error fetching product attributes: ${error}`);
        }
        return attributes as IProductAttributeDetail[];
    }

}

class PrivateAttributesApiWrapper {

    // ========== ADMIN: Attribute CRUD ==========

    async listAdminAttributes(auth_token: string, includeValues: boolean = false): Promise<IAttribute[] | IAttributeWithValues[]> {
        const params = new URLSearchParams();
        if (includeValues) params.set('include_values', 'true');

        const [error, attributes] = await fetcher(`${ADMIN_ATTRIBUTES_PATH}?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${auth_token}`,
            }
        });

        if (error) {
            console.error(`Error fetching admin attributes: ${error}`);
            throw new Error(`Error fetching admin attributes: ${error}`);
        }
        return attributes as IAttribute[] | IAttributeWithValues[];
    }

    async createAttribute(auth_token: string, attributeData: IAttributeCreateDTO): Promise<IAttribute> {
        const [error, createdAttribute] = await fetcher(ADMIN_ATTRIBUTES_PATH, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attributeData)
        });

        if (error) {
            console.error(`Error creating attribute: ${error}`);
            throw new Error(`Error creating attribute: ${error}`);
        }

        return createdAttribute as IAttribute;
    }

    async deleteAttribute(auth_token: string, attributeId: number): Promise<{ message: string }> {
        const [error, response] = await fetcher(`${ADMIN_ATTRIBUTES_PATH}/${attributeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (error) {
            console.error(`Error deleting attribute ${attributeId}: ${error}`);
            throw new Error(`Error deleting attribute ${attributeId}: ${error}`);
        }

        return response as { message: string };
    }

    // ========== ADMIN: Attribute Value CRUD ==========

    async createAttributeValue(auth_token: string, attributeId: number, valueData: IAttributeValueCreateDTO): Promise<IAttributeValue> {
        const [error, createdValue] = await fetcher(`${ADMIN_ATTRIBUTES_PATH}/${attributeId}/values`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(valueData)
        });

        if (error) {
            console.error(`Error creating attribute value: ${error}`);
            throw new Error(`Error creating attribute value: ${error}`);
        }

        return createdValue as IAttributeValue;
    }

    async deleteAttributeValue(auth_token: string, attributeId: number, valueId: number): Promise<{ message: string }> {
        const [error, response] = await fetcher(`${ADMIN_ATTRIBUTES_PATH}/${attributeId}/values/${valueId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (error) {
            console.error(`Error deleting attribute value ${valueId}: ${error}`);
            throw new Error(`Error deleting attribute value ${valueId}: ${error}`);
        }

        return response as { message: string };
    }

    // ========== BRAND OWNER: Product Attributes ==========

    async assignProductAttributes(auth_token: string, productId: number, attributesData: IProductAttributesAssignDTO): Promise<{ message: string }> {
        const [error, response] = await fetcher(`/products/${productId}/attributes`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(attributesData)
        });

        if (error) {
            console.error(`Error assigning attributes to product ${productId}: ${error}`);
            throw new Error(`Error assigning attributes to product ${productId}: ${error}`);
        }

        return response as { message: string };
    }

    async removeProductAttributes(auth_token: string, productId: number, attributeIds?: number[]): Promise<{ message: string }> {
        const url = attributeIds && attributeIds.length > 0
            ? `/products/${productId}/attributes?attributeIds=${attributeIds.join(',')}`
            : `/products/${productId}/attributes`;

        const [error, response] = await fetcher(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            }
        });

        if (error) {
            console.error(`Error removing attributes from product ${productId}: ${error}`);
            throw new Error(`Error removing attributes from product ${productId}: ${error}`);
        }

        return response as { message: string };
    }

    // ========== BRAND OWNER: Bulk Product Attributes ==========

    async assignAttributesToMultipleProducts(
        auth_token: string,
        brandId: string,
        productIds: number[],
        attributesData: IProductAttributesAssignDTO
    ): Promise<{ message: string }> {
        const [error, response] = await fetcher(`/brands/${brandId}/products/attributes`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productIds,
                attributes: attributesData.attributes
            })
        });

        if (error) {
            console.error(`Error assigning attributes to multiple products: ${error}`);
            throw new Error(`Error assigning attributes to multiple products: ${error}`);
        }

        return response as { message: string };
    }

    async removeAttributesFromMultipleProducts(
        auth_token: string,
        brandId: string,
        productIds: number[],
        attributeIds: number[]
    ): Promise<{ message: string }> {
        const [error, response] = await fetcher(`/brands/${brandId}/products/attributes`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productIds,
                attributeIds
            })
        });

        if (error) {
            console.error(`Error removing attributes from multiple products: ${error}`);
            throw new Error(`Error removing attributes from multiple products: ${error}`);
        }

        return response as { message: string };
    }
}

export const publicAttributesApiWrapper = new PublicAttributesApiWrapper();
export const privateAttributesApiWrapper = new PrivateAttributesApiWrapper();
