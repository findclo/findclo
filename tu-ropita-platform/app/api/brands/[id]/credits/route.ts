import { brandService } from "@/lib/backend/services/brand.service";
import { brandCreditsService } from "@/lib/backend/services/brand_credits.service";
import { withAdminPermission, withBrandPermission } from "@/lib/routes_middlewares";
import { getBrandCreditsDtoFromBody, parseErrorResponse } from "@/lib/utils";
export const GET = withBrandPermission(async (req: Request, {params}: {params: {id:string}}) => {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        const brand = await brandService.getBrandById(parseInt(params.id));

        const brandCredits = await brandCreditsService.getBrandCredits(brand.id);
        return new Response(JSON.stringify(brandCredits), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
});

//TODO: ver si solo lo puede hacer el admin o el brand tmbn
export const POST = withAdminPermission(async (req: Request, {params}: {params: {id:string}}) => {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }
        const brand = await brandService.getBrandById(parseInt(params.id));
        const brandCreditsDto = await getBrandCreditsDtoFromBody(req);
        const brandCredits = await brandCreditsService.addBrandCredits(brand.id, brandCreditsDto.add_credits);
        return new Response(JSON.stringify(brandCredits), { 
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }catch (error:any) {
        return parseErrorResponse(error);
    }
});
