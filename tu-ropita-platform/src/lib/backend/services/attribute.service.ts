import {
    IAttribute,
    IAttributeValue,
    IAttributeWithValues,
    IProductAttributeDetail
} from "@/lib/backend/models/interfaces/attribute.interface";
import {
    IAttributeCreateDTO,
    IAttributeValueCreateDTO,
    IProductAttributesAssignDTO,
    IAttributeFilterDTO
} from "@/lib/backend/dtos/attribute.dto.interface";
import { attributeRepository } from "@/lib/backend/persistance/attribute.repository";
import { AttributeNotFoundException, AttributeValueNotFoundException } from "@/lib/backend/exceptions/attributeNotFoundException";
import { embeddingProcessorService } from "@/lib/backend/services/embeddingProcessor.service";

class AttributeService {

    // ========== ATTRIBUTES CRUD ==========

    async createAttribute(data: IAttributeCreateDTO): Promise<IAttribute> {
        const slug = this.generateSlug(data.name);

        try {
            await attributeRepository.getAttributeBySlug(slug);
            throw new Error(`An attribute with the name "${data.name}" already exists.`);
        } catch (error) {
            if (!(error instanceof AttributeNotFoundException)) {
                throw error;
            }
        }

        return await attributeRepository.createAttribute(data, slug);
    }

    async deleteAttribute(id: number): Promise<boolean> {
        return await attributeRepository.deleteAttribute(id);
    }

    async getAttributeById(id: number): Promise<IAttribute> {
        return await attributeRepository.getAttributeById(id);
    }

    async getAttributeBySlug(slug: string): Promise<IAttribute> {
        return await attributeRepository.getAttributeBySlug(slug);
    }

    async listAttributes(includeValues?: boolean): Promise<IAttribute[] | IAttributeWithValues[]> {
        if (includeValues) {
            return await attributeRepository.listAttributesWithValues();
        }
        return await attributeRepository.listAttributes();
    }

    async getAttributeWithValues(attributeId: number): Promise<IAttributeWithValues> {
        return await attributeRepository.getAttributeWithValues(attributeId);
    }


    async createAttributeValue(attributeId: number, data: IAttributeValueCreateDTO): Promise<IAttributeValue> {
        const slug = this.generateSlug(data.value);

        try {
            await attributeRepository.getAttributeValueBySlug(attributeId, slug);
            throw new Error(`A value "${data.value}" already exists for this attribute.`);
        } catch (error) {
            if (!(error instanceof AttributeValueNotFoundException)) {
                throw error;
            }
        }

        return await attributeRepository.createAttributeValue(attributeId, data, slug);
    }

    async deleteAttributeValue(valueId: number): Promise<boolean> {
        return await attributeRepository.deleteAttributeValue(valueId);
    }

    async listAttributeValues(attributeId: number): Promise<IAttributeValue[]> {
        return await attributeRepository.listAttributeValues(attributeId);
    }

    // ========== PRODUCT ATTRIBUTES ==========

    async assignAttributesToProduct(productId: number, data: IProductAttributesAssignDTO): Promise<void> {
        await attributeRepository.assignAttributesToProduct(productId, data);
        embeddingProcessorService.generateEmbeddingForProduct(productId);
    }

    async getProductAttributes(productId: number): Promise<IProductAttributeDetail[]> {
        return await attributeRepository.getProductAttributes(productId);
    }

    async removeProductAttributes(productId: number, attributeIds?: number[]): Promise<void> {
        await attributeRepository.removeProductAttributes(productId, attributeIds);
        embeddingProcessorService.generateEmbeddingForProduct(productId);
    }

    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')                          // Normaliza caracteres especiales
            .replace(/[\u0300-\u036f]/g, '')          // Elimina diacríticos
            .replace(/[^a-z0-9\s-]/g, '')             // Solo letras, números, espacios y guiones
            .replace(/\s+/g, '-')                      // Espacios a guiones
            .replace(/-+/g, '-')                       // Múltiples guiones a uno solo
            .replace(/^-+|-+$/g, '')                   // Elimina guiones al inicio/final
            .trim();
    }
}

export const attributeService = new AttributeService();
