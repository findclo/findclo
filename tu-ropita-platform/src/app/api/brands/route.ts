import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import {brandService} from "@/lib/backend/services/brand.service";
import {productTagsService} from "@/lib/backend/services/productsTags.service";

export async function GET(req: Request) {
    try {

        const brands : IBrand[] = await brandService.listBrands();
        return new Response(JSON.stringify(brands), { status: 200 });

    } catch (error:any) {
        return new Response(null, { status: error.statusCode? error.statusCode : 500  });
    }

}