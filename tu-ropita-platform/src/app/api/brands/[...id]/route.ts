import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import {brandService} from "@/lib/backend/services/brand.service";
import {isNumber} from "node:util";

export async function GET(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            return new Response('Invalid brand ID', { status: 400 });
        }

        const brand: IBrand = await brandService.getBrandById(Number(params.id));
        return new Response(JSON.stringify(brand), { status: 200 });
    } catch (error) {
        console.log(error)
        return new Response(null, { status: 500 });
    }

}