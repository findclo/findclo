import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandService } from "@/lib/backend/services/brand.service";
import {getBrandDtoFromBody, parseErrorResponse} from "@/lib/utils";

export async function PUT(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        const body = await req.json();
        const status = body.status;

        if(!status){
            return parseErrorResponse({ statusCode: 400, errorMessage:'Missing status parameter in body' })
        }

        const brand: IBrand = await brandService.changeBrandStatus(Number(params.id), status);
        return new Response(JSON.stringify(brand), { status: 200 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}