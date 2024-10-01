import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandService } from "@/lib/backend/services/brand.service";
import {getBrandDtoFromBody, getUpdateStatusFromBody, parseErrorResponse} from "@/lib/utils";
import {withAdminPermission} from "@/lib/routes_middlewares";

export const PUT = withAdminPermission(async(req: Request, {params}: {params: {id:string}}) => {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        const body = await getUpdateStatusFromBody(req);

        const brand: IBrand = await brandService.changeBrandStatus(Number(params.id), body.status);
        return new Response(JSON.stringify(brand), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
});