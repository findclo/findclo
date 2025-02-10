import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IListProductsParams } from "@/lib/backend/persistance/products.repository";
import { productService } from "@/lib/backend/services/product.service";
import { promotionService } from "@/lib/backend/services/promotion.service";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    // example of url : BASEURL/api/products?search=xxx&brandId=xxx&tag=summer&tag=..
    const listProductParams: IListProductsParams = {
        search: queryParams.get('search') || undefined,
        brandId: queryParams.has('brandId') ? Number(queryParams.get('brandId')) : undefined,
        tags: queryParams.has('tags') ? queryParams.get('tags')!.split(',') : undefined,
        productId: queryParams.has('productId') ? Number(queryParams.get('productId')) : undefined,
        featured: queryParams.has('featured') ? true : false,
        isLandingPage: queryParams.has('isLandingPage') ? queryParams.get('isLandingPage') === 'true' : false,
        skipAI: queryParams.has('skipAI') ? queryParams.get('skipAI') === 'true' : false
    };

    try {
        listProductParams.userQuery = true;
        const products : IListProductResponseDto = await productService.listProducts(listProductParams);

        if(listProductParams.featured){
            const products_ids = products.products.map(p => p.id);
            await promotionService.spendProductPromotionsCredits(products_ids);
        }

        return new Response(JSON.stringify(products), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(null, { status: error.statusCode? error.statusCode : 500 });
    }

}
