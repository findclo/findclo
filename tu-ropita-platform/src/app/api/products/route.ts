import {productService} from "@/lib/backend/services/product.service";
import {IListProductsParams} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);

    const listProductParams: IListProductsParams = {
        search: queryParams.get('search') || undefined,
        brandId: queryParams.has('brandId') ? Number(queryParams.get('brandId')) : undefined,
    };

    try {
        const products = await productService.listProducts(listProductParams);
        return new Response(JSON.stringify(products), { status: 200 });

    } catch (error) {
        return new Response(null, { status: 500 });
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
    } catch (error){
        console.log(error)
        return new Response(null, { status: 500 });
    }
}