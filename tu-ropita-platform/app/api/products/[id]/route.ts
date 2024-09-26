import {parseErrorResponse} from "@/lib/utils";
import {productService} from "@/lib/backend/services/product.service";

export async function DELETE(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid product ID', { status: 400 });
        }

        await productService.deleteProduct(Number(params.id));
        return new Response(null, { status: 204 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}