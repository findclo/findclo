import { attributeService } from "@/lib/backend/services/attribute.service";
import { withAdminPermission } from "@/lib/routes_middlewares";
import { parseErrorResponse, parseSuccessResponse } from "@/lib/utils";

// DELETE /api/admin/attributes/[id]/values/[valueId]
export const DELETE = withAdminPermission(async (req: Request, { params }: { params: { id: string; valueId: string } }) => {
    try {
        const valueId = parseInt(params.valueId);
        if (isNaN(valueId)) {
            return new Response(JSON.stringify({ error: 'Invalid value ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const success = await attributeService.deleteAttributeValue(valueId);

        if (success) {
            return parseSuccessResponse({ message: 'Attribute value deleted successfully' });
        } else {
            return new Response(JSON.stringify({ error: 'Attribute value not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});
