import { promotionService } from "@/lib/backend/services/promotion.service";
import { withBrandPermission } from "@/lib/routes_middlewares";

export const PATCH = withBrandPermission(async (req: Request, {params}: {params: {promotionId:string}}) => {
    try{
        const promotionId = parseInt(params.promotionId);
        await promotionService.stopPromotion(promotionId);
        return new Response(null, { 
        status: 204,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    } catch (error: any) {
        return new Response(null, { 
            status: error.statusCode? error.statusCode : 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
});

export const GET = withBrandPermission(async (req: Request, {params}: {params: {promotionId: string}}) => {
    const promotionId = parseInt(params.promotionId);
    try {
        const promotion = await promotionService.getPromotionById(promotionId);
        return new Response(JSON.stringify(promotion), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any) {
        return new Response(null, { 
            status: error.statusCode? error.statusCode : 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
});