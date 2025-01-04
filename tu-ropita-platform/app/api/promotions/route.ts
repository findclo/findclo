import { IPromotionDto } from "@/lib/backend/dtos/promotion.dto.interface";
import { brandCreditsService } from "@/lib/backend/services/brand_credits.service";
import { productService } from "@/lib/backend/services/product.service";
import { promotionService } from "@/lib/backend/services/promotion.service";
import { withBrandPermission } from "@/lib/routes_middlewares";
import { getPromotionDtoFromBody } from "@/lib/utils";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const forLandingPage = url.searchParams.get('forLandingPage') === 'true';
    try {
        const promotions = await promotionService.getActivePromotions(forLandingPage);
        return new Response(JSON.stringify(promotions), { 
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
}

export const POST = withBrandPermission(async (req: Request) => {
    const brandId = (req as any).brandId as number;
    if(!brandId){
        return new Response(JSON.stringify({error: 'Brand not found'}), { 
            status: 404,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    const promotionDto : IPromotionDto = await getPromotionDtoFromBody(req);

    const product = await productService.getProductById(promotionDto.product_id, true);
    if(product.brand.id !== brandId){
        return new Response(JSON.stringify({error: 'Product not from brand'}), {
            status: 409,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    if(product.status !== 'ACTIVE'){
        return new Response(JSON.stringify({error: 'Product not active'}), {
            status: 409,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    const existingPromotion = await promotionService.hasPromotionForProduct(promotionDto.product_id);
    if(existingPromotion){
        return new Response(JSON.stringify({error: `Promotion already exists for this product. [product_id: ${promotionDto.product_id}]`}), {
            status: 409,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    //TODO: ver si se puede hacer en el servicio
    const brandCredits = await brandCreditsService.getBrandCredits(brandId);
    if((brandCredits.credits_available - brandCredits.credits_spent) < promotionDto.credits_allocated){
        return new Response(JSON.stringify({error: 'Brand does not have enough credits'}), { 
            status: 409,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const promotion = await promotionService.createPromotion({...promotionDto, id: 0, credits_spent: 0});
    
    await brandCreditsService.spendBrandCredits(brandId, promotionDto.credits_allocated);
    return new Response(JSON.stringify(promotion), { 
        status: 201,
        headers: {
            'Content-Type': 'application/json'
        }
    });
});