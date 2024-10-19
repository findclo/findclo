import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { productService } from "@/lib/backend/services/product.service";
import { withProductBrandPermission } from "@/lib/routes_middlewares";
import { getUpdateStatusFromBody, parseErrorResponse } from "@/lib/utils";

export const PUT = withProductBrandPermission(async(req: Request, {params}: {params: {id:string}}) =>{
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid product ID', { status: 400 });
        }

        const body = await getUpdateStatusFromBody(req);

        const product: IProduct = await productService.updateProductStatus(Number(params.id), body.status);
        return new Response(JSON.stringify(product), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
});