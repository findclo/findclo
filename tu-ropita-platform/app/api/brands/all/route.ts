import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import {brandService} from "@/lib/backend/services/brand.service";
import {parseErrorResponse} from "@/lib/utils";
import {withAdminPermissionNoParams} from "@/lib/routes_middlewares";

export const GET = withAdminPermissionNoParams(async (req: Request) => {
    try {

        const brands : IBrand[] = await brandService.listBrands();
        return Response.json(brands, { status: 200 });

    } catch (error:any) {
        return parseErrorResponse(error);
    }

});