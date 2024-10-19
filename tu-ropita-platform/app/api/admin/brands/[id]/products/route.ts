import { productService } from "@/lib/backend/services/product.service";
import {withAdminPermission} from "@/lib/routes_middlewares";



export const GET = withAdminPermission(async(req: Request, {params}: {params: {id:string}}) => {
    try{
        const products = await productService.listProducts({brandId: parseInt(params.id),excludeBrandPaused: false});


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
