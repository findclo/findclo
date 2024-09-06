import {productService} from "@/lib/backend/services/product.service";

export async function GET(req: Request) {

    try {
        const products = await productService.listProducts();
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