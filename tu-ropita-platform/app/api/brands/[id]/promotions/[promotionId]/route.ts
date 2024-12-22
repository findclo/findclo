import { promotionService } from "@/lib/backend/services/promotion.service";
import { withBrandPermission } from "@/lib/routes_middlewares";

export const PATCH = withBrandPermission(async (req: Request, {params}: {params: {promotionId:string}}) => {
    const promotionId = parseInt(params.promotionId);
    await promotionService.stopPromotion(promotionId);
    return new Response(null, { 
        status: 204,
        headers: {
            'Content-Type': 'application/json'
        }
    });
});