import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandService } from "@/lib/backend/services/brand.service";
import {getBrandDtoFromBody, parseErrorResponse} from "@/lib/utils";

export async function GET(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        const brand: IBrand = await brandService.getBrandById(Number(params.id));
        return new Response(JSON.stringify(brand), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}

export async function PUT(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        const brandDto = await getBrandDtoFromBody(req);
        const brand: IBrand = await brandService.updateBrand(Number(params.id), brandDto);
        return new Response(JSON.stringify(brand), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}

export async function DELETE(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        await brandService.deleteBrand(Number(params.id));
        return new Response(null, { status: 204 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}