import { attributeService } from "@/lib/backend/services/attribute.service";
import { IAttributeCreateDTO } from "@/lib/backend/dtos/attribute.dto.interface";
import { withAdminPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody, parseErrorResponse, parseSuccessResponse } from "@/lib/utils";

export const GET = withAdminPermission(async (req: Request) => {
    try {
        const url = new URL(req.url);
        const includeValues = url.searchParams.get('include_values') === 'true';

        const attributes = await attributeService.listAttributes(includeValues);

        return parseSuccessResponse(attributes);
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});

// POST /api/admin/attributes
export const POST = withAdminPermission(async (req: Request) => {
    try {
        const attributeData: IAttributeCreateDTO = await getDtoFromBody(
            req,
            ['name']
        );

        const attribute = await attributeService.createAttribute(attributeData);

        return parseSuccessResponse(attribute);
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});
