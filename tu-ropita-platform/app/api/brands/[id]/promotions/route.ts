import { promotionService } from "@/lib/backend/services/promotion.service";
import { withBrandPermission } from "@/lib/routes_middlewares";
import { parseErrorResponse } from "@/lib/utils";

export const GET = withBrandPermission(async (req: Request, {params}: {params: {id:string}}) => {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }
        const brandId = parseInt(params.id);
        const promotions = await promotionService.getPromotionsByBrandId(brandId);
        return new Response(JSON.stringify(promotions), { 
        status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
});