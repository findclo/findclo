import {getProductDtoFromBody, parseErrorResponse} from "@/lib/utils";
import {productService} from "@/lib/backend/services/product.service";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";
import { withProductBrandPermission} from "@/lib/routes_middlewares";


export async function GET(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid product ID', { status: 400 });
        }

        const product: IProduct = await productService.getProductById(parseInt(params.id));
        return new Response(JSON.stringify(product), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}

export const PUT = withProductBrandPermission(async(req: Request, {params}: {params: {id:string}}) =>{
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid product ID', { status: 400 });
        }

        const productDto : IProductDTO = await getProductDtoFromBody(req);
        const product: IProduct = await productService.updateProduct(Number(params.id), productDto);
        return new Response(JSON.stringify(product), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
});

export const DELETE = withProductBrandPermission(async(req: Request, {params}: {params: {id:string}}) =>{
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid product ID', { status: 400 });
        }

        await productService.deleteProduct(Number(params.id));
        return new Response(null, { status: 204 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
});

