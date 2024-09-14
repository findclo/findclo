import {productService} from "@/lib/backend/services/product.service";
import {IListProductsParams} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";
import {IListProductResponseDto} from "@/lib/backend/dtos/listProductResponse.dto.interface";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);

    // example of url : BASEURL/api/products?search=xxx&brandId=xxx&tagsIds=1,12,32
    const listProductParams: IListProductsParams = {
        search: queryParams.get('search') || undefined,
        brandId: queryParams.has('brandId') ? Number(queryParams.get('brandId')) : undefined,
        tagsIds: queryParams.has('tagsIds') ? queryParams.get('tagsIds')!.split(',') : undefined
    };

    try {
        const products : IListProductResponseDto = await productService.listProducts(listProductParams);
        return new Response(JSON.stringify(products), { status: 200 });

    } catch (error: any) {
        return new Response(null, { status: error.statusCode? error.statusCode : 500 });
    }

}

export async function POST(req: Request){
    try{
        const formData : FormData = await req.formData();

        const file  = formData.get("file");

        if(!(file && file instanceof File)){
            return new Response('Missing file', { status: 400 });
        }

        await productService.uploadProductsFromCSV(file);


        return new Response(null, {status: 200});
    } catch (error: any){
        console.log(error)
        return new Response(null, { status: error.statusCode? error.statusCode : 500 });
    }
}