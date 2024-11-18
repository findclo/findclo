import {withAdminPermissionNoParams} from "@/lib/routes_middlewares";
import {productsInteractionsService} from "@/lib/backend/services/productsInteractions.service";
import {parseErrorResponse, validateDateParameters} from "@/lib/utils";

export const GET = withAdminPermissionNoParams(async (req: Request) => {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    validateDateParameters(startDate, endDate);

    try {
        const metrics = await productsInteractionsService.getMetricByProduct(new Date(startDate!), new Date(endDate!));

        return new Response(JSON.stringify(metrics), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});