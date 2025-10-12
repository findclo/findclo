import { attributeService } from "@/lib/backend/services/attribute.service";
import { IProductAttributesAssignDTO } from "@/lib/backend/dtos/attribute.dto.interface";
import { withProductBrandPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody, parseErrorResponse, parseSuccessResponse } from "@/lib/utils";

// GET /api/products/[id]/attributes - Public endpoint to get product attributes
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const productId = parseInt(params.id);
        if (isNaN(productId)) {
            return new Response(JSON.stringify({ error: 'Invalid product ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const attributes = await attributeService.getProductAttributes(productId);

        return new Response(JSON.stringify(attributes), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
}

// PUT /api/products/[id]/attributes - Assign attributes to product (Brand owner only)
export const PUT = withProductBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const productId = parseInt(params.id);
        if (isNaN(productId)) {
            return new Response(JSON.stringify({ error: 'Invalid product ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const assignmentData: IProductAttributesAssignDTO = await getDtoFromBody(
            req,
            ['attributes']
        );

        await attributeService.assignAttributesToProduct(productId, assignmentData);

        return parseSuccessResponse({ message: 'Attributes assigned successfully' });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});

// DELETE /api/products/[id]/attributes - Remove attributes from product (Brand owner only)
export const DELETE = withProductBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const productId = parseInt(params.id);
        if (isNaN(productId)) {
            return new Response(JSON.stringify({ error: 'Invalid product ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Parse optional attribute IDs from request body (if provided, only remove specific attributes)
        const url = new URL(req.url);
        const attributeIdsParam = url.searchParams.get('attributeIds');
        let attributeIds: number[] | undefined;

        if (attributeIdsParam) {
            try {
                attributeIds = attributeIdsParam.split(',').map(id => parseInt(id.trim()));
                if (attributeIds.some(isNaN)) {
                    return new Response(JSON.stringify({ error: 'Invalid attribute IDs' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } catch (error) {
                return new Response(JSON.stringify({ error: 'Invalid attribute IDs format' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        await attributeService.removeProductAttributes(productId, attributeIds);

        return parseSuccessResponse({ message: 'Attributes removed successfully' });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});
