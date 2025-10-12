import { attributeService } from "@/lib/backend/services/attribute.service";
import { withAdminPermission } from "@/lib/routes_middlewares";
import { parseErrorResponse, parseSuccessResponse } from "@/lib/utils";

// DELETE /api/admin/attributes/[id]
export const DELETE = withAdminPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const attributeId = parseInt(params.id);
        const success = await attributeService.deleteAttribute(attributeId);

        if (success) {
            return parseSuccessResponse({ message: 'Attribute deleted successfully' });
        } else {
            return new Response(JSON.stringify({ error: 'Attribute not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});
