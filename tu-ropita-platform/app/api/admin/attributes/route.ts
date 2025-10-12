import { attributeService } from "@/lib/backend/services/attribute.service";
import { IAttributeCreateDTO } from "@/lib/backend/dtos/attribute.dto.interface";
import { withAdminPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody, parseErrorResponse, parseSuccessResponse } from "@/lib/utils";

export const GET = withAdminPermission(async (req: Request) => {
    try {
        const url = new URL(req.url);
        const includeValues = url.searchParams.get('include_values') === 'true';
        const filterableOnly = url.searchParams.get('filterable_only') === 'true';

        const attributes = await attributeService.listAttributes(includeValues, filterableOnly);

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
            ['name', 'type'],
            ['filterable', 'visible_in_ui', 'sort_order']
        );

        const attribute = await attributeService.createAttribute(attributeData);

        return parseSuccessResponse(attribute);
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});
