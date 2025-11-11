import { attributeRepository } from "@/lib/backend/persistance/attribute.repository";
import { IProductAttributesAssignDTO } from "@/lib/backend/dtos/attribute.dto.interface";
import { withBrandPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody } from "@/lib/utils";
import { embeddingProcessorService } from "@/lib/backend/services/embeddingProcessor.service";

interface IBulkProductAttributesDTO {
    productIds: number[];
    attributes: IProductAttributesAssignDTO['attributes'];
}

interface IBulkProductAttributesRemovalDTO {
    productIds: number[];
    attributeIds: number[];
}

export const PUT = withBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const body: IBulkProductAttributesDTO = await getDtoFromBody(req, ['productIds', 'attributes']);

        await attributeRepository.assignAttributesToMultipleProducts(body.productIds, {
            attributes: body.attributes
        });

        // Trigger embedding generation for all affected products
        body.productIds.forEach(productId => {
            embeddingProcessorService.generateEmbeddingForProduct(productId);
        });

        return new Response(JSON.stringify({
            message: `Attributes assigned to ${body.productIds.length} product(s)`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error assigning attributes to products:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

export const DELETE = withBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const body: IBulkProductAttributesRemovalDTO = await getDtoFromBody(req, ['productIds', 'attributeIds']);

        await attributeRepository.removeAttributesFromMultipleProducts(body.productIds, body.attributeIds);

        // Trigger embedding generation for all affected products
        body.productIds.forEach(productId => {
            embeddingProcessorService.generateEmbeddingForProduct(productId);
        });

        return new Response(JSON.stringify({
            message: `Attributes removed from ${body.productIds.length} product(s)`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error removing attributes from products:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
