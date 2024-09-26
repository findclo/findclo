import {getProductDtoFromBody, parseErrorResponse} from "@/lib/utils";
import {productService} from "@/lib/backend/services/product.service";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

export async function PUT(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid product ID', { status: 400 });
        }

        const productDto = await getProductDtoFromBody(req);
        const product: IProduct = await productService.updateProduct(Number(params.id), productDto);
        return new Response(JSON.stringify(product), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}

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