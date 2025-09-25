import { productService } from "@/lib/backend/services/product.service";
import { withBrandPermission } from "@/lib/routes_middlewares";

export const POST = withBrandPermission(async(req: Request, {params}: {params: {id:string}}) => {
    try {
        const contentType = req.headers.get('content-type');

        if (contentType && contentType.includes('multipart/form-data')) {
            // Handle FormData (multiple products)
            const formData: FormData = await req.formData();
            const file = formData.get("file");

            if (!(file && file instanceof File)) {
                return new Response('Missing file', { status: 400 });
            }

            await productService.uploadProductsFromCSV(file, params.id);
            return new Response(null, { status: 204 });
        } else {
            // Handle JSON body (single product)
            const productData = await req.json();
            const createdProduct = await productService.createProduct(productData, params.id);
            return new Response(JSON.stringify(createdProduct), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error: any) {
        console.error(error);
        return new Response(null, { status: error.statusCode || 500 });
    }
});

export const GET = withBrandPermission(async(req: Request, {params}: {params: {id:string}}) => {
    try{
        const url = new URL(req.url);
        const includeCategories = url.searchParams.get('includeCategories') === 'true';

        const products = await productService.listProducts({
            brandId: parseInt(params.id),
            includeCategories
        });

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
});
