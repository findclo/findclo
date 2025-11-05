import { productService } from "@/lib/backend/services/product.service";
import {withBrandPermission} from "@/lib/routes_middlewares";
import { UserTypeEnum } from "@/lib/backend/models/interfaces/user.interface";



export const GET = withBrandPermission(async(req: Request, {params}: {params: {id:string}}) => {
    try{
        // Parse query parameters
        const url = new URL(req.url);
        const includeCategories = url.searchParams.get('includeCategories') === 'true';
        const includeAttributes = url.searchParams.get('includeAttributes') === 'true';

        // Only admins should see deleted products
        const user = (req as any).user;
        const includeDeleted = user?.user_type === UserTypeEnum.ADMIN;

        const products = await productService.listProducts({
            brandId: parseInt(params.id),
            excludeBrandPaused: false,
            includeCategories,
            includeAttributes,
            includeDeleted
        });


        return new Response(JSON.stringify(products), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any){
        console.log(error)
        return new Response(null, {
            status: error.statusCode? error.statusCode : 500 ,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
});
