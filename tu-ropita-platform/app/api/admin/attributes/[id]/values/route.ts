import { attributeService } from "@/lib/backend/services/attribute.service";
import { IAttributeValueCreateDTO } from "@/lib/backend/dtos/attribute.dto.interface";
import { withAdminPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody, parseErrorResponse, parseSuccessResponse } from "@/lib/utils";

// POST /api/admin/attributes/[id]/values
export const POST = withAdminPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const attributeId = parseInt(params.id);
        if (isNaN(attributeId)) {
            return new Response(JSON.stringify({ error: 'Invalid attribute ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const valueData: IAttributeValueCreateDTO = await getDtoFromBody(
            req,
            ['value'],
            ['sort_order']
        );

        const attributeValue = await attributeService.createAttributeValue(attributeId, valueData);

        return parseSuccessResponse(attributeValue);
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});
