import {productTagsService} from "@/lib/backend/services/productsTags.service";

export async function POST(req: Request){
    try{
        await productTagsService.tagPendingProducts();

        return new Response(null, {status: 200});
    } catch (error){
        console.log(error)
        return new Response(null, { status: 500 });
    }
}