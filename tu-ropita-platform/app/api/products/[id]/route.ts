import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { productService } from "@/lib/backend/services/product.service";
import { withProductBrandPermission } from "@/lib/routes_middlewares";
import { getProductDtoFromBody, parseErrorResponse } from "@/lib/utils";
import {IListProductsParams} from "@/lib/backend/persistance/products.repository";


export async function GET(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid product ID', { status: 400 });
        }
        const url = new URL(req.url);
        const queryParams = new URLSearchParams(url.search);
        // example of url : BASEURL/api/products?search=xxx&brandId=xxx
        const product: IProduct = await productService.getProductById(parseInt(params.id),true);
        return new Response(JSON.stringify(product), { status: 200 ,
            headers: {
                'Content-Type': 'application/json'
            }
        });
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
        return new Response(JSON.stringify(product), { status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
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

