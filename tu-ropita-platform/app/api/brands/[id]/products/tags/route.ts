import {withBrandPermission} from "@/lib/routes_middlewares";
import {productTagsService} from "@/lib/backend/services/productsTags.service";

export const GET = withBrandPermission(async (req: Request, {params}: { params: { id: string } }) => {
    try {
        const csv = await productTagsService.getProductsTagsFromBrandAsCsv(parseInt(params.id));

        return new Response(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="products_tags.csv"'
            }
        });
    } catch (error: any) {
        console.log(error);
        return new Response(null, {
            status: error.statusCode ? error.statusCode : 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
});