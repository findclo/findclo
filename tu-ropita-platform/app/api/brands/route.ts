import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import {brandService} from "@/lib/backend/services/brand.service";
import {getBrandDtoFromBody, parseErrorResponse} from "@/lib/utils";

export async function GET(req: Request) {
    try {

        const brands : IBrand[] = await brandService.listBrands();
        return new Response(JSON.stringify(brands), { status: 200 });

    } catch (error:any) {
        return parseErrorResponse(error);
    }

}

export async function POST(req: Request) {
    try {
        const brandDto = await getBrandDtoFromBody(req)
        const brand : IBrand = await brandService.createBrand(brandDto);
        return new Response(JSON.stringify(brand), { status: 200 });

    } catch (error:any) {
        return parseErrorResponse(error);
    }
}