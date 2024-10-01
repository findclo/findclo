import {getUpdateStatusFromBody, parseErrorResponse} from "@/lib/utils";
import {productService} from "@/lib/backend/services/product.service";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export async function PUT(req: Request, {params}: {params: {id:string}}) {
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
}