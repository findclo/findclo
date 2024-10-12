import { productService } from "@/lib/backend/services/product.service";
import { withBrandPermission } from "@/lib/routes_middlewares";

export const POST = withBrandPermission(async(req: Request, {params}: {params: {id:string}}) =>{
    try{
        const formData : FormData = await req.formData();

        const file  = formData.get("file");

        if(!(file && file instanceof File)){
            return new Response('Missing file', { status: 400 });
        }

        await productService.uploadProductsFromCSV(file,params.id);


        return new Response(null, {status: 204});
    } catch (error: any){
        console.log(error)
        return new Response(null, { status: error.statusCode? error.statusCode : 500 });
    }
});

export async function GET(req: Request, {params}: {params: {id:string}}) {
    try{
        const products = await productService.listProducts({brandId: parseInt(params.id)});


        return new Response(JSON.stringify(products), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any){
        console.log(error)
        return new Response(null, {
            status: error.statusCode? error.statusCode : 500 ,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
