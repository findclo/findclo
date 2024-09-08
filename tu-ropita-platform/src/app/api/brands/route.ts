import {IBrand} from "@/lib/backend/models/interfaces/brand.interface";
import {brandService} from "@/lib/backend/services/brand.service";

export async function GET(req: Request) {
    try {
        const brands : IBrand[] = await brandService.listBrands();
        return new Response(JSON.stringify(brands), { status: 200 });

    } catch (error) {
        console.log(error)
        return new Response(null, { status: 500 });
    }

}