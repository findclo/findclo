import { brandService } from "@/lib/backend/services/brand.service";
import { withAdminPermission } from "@/lib/routes_middlewares";
import { parseErrorResponse } from "@/lib/utils";

export const GET = withAdminPermission(async (req: Request, {params}: {params: {id:string}}) => {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        const owners = await brandService.getBrandOwners(parseInt(params.id));
        return new Response(JSON.stringify({ owners }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
});
