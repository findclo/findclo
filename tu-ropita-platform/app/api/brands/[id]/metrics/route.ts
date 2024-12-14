import { productsInteractionsService } from "@/lib/backend/services/productsInteractions.service";
import { withBrandPermission } from "@/lib/routes_middlewares";
import { validateDateParameters } from "@/lib/utils";

export const GET = withBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const brandId = url.searchParams.get("brand") ?? undefined;

    validateDateParameters(startDate, endDate);

    try {
        let metrics = await productsInteractionsService.getMetrics(new Date(startDate!), new Date(endDate!),brandId);

        return new Response(JSON.stringify(metrics), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        console.error("Error fetching product metrics between dates:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: error.statusCode ? error.statusCode : 500,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
});