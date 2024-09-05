import {productService} from "@/lib/backend/services/product.service";

export async function GET(req: Request) {

    try {
        const products = productService.listProducts();
        return new Response(JSON.stringify(products), { status: 200 });

    } catch (error) {
        return new Response(null, { status: 500 });
    }

}