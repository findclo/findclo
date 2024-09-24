import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import {brandService} from "@/lib/backend/services/brand.service";
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";
import {InvalidBrandException} from "@/lib/backend/exceptions/invalidBrand.exception";

export async function GET(req: Request) {
    try {

        const brands : IBrand[] = await brandService.listBrands();
        return new Response(JSON.stringify(brands), { status: 200 });

    } catch (error:any) {
        return new Response(null, { status: error.statusCode? error.statusCode : 500  });
    }

}

export async function POST(req: Request) {
    try {
        const brandDto = await getBrandDtoFromBody(req)
        const brand : IBrand = await brandService.createBrand(brandDto);
        return new Response(JSON.stringify(brand), { status: 200 });

    } catch (error:any) {

        const statusCode = error.statusCode ? error.statusCode : 500;
        const message    = error.errorMessage    ? error.errorMessage    : 'Internal Server Error';

        return new Response(JSON.stringify({ error: message }), {
            status: statusCode,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


async function getBrandDtoFromBody(req: Request) : Promise<IBrandDto>{
    const body = await req.json();

    if( body && body.name && body.image && body.websiteUrl && body.websiteUrl){
        return {
            name: body.name,
            image: body.image,
            websiteUrl: body.websiteUrl
        } as IBrandDto;
    }
    throw new InvalidBrandException();
}