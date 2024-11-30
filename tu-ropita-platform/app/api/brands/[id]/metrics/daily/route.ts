import {withBrandPermission} from "@/lib/routes_middlewares";
import {parseErrorResponse, validateDateParameters} from "@/lib/utils";
import {productsInteractionsService} from "@/lib/backend/services/productsInteractions.service";

export const GET =  withBrandPermission(async(req: Request, {params}: {params: {id:string}}) => {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const brandId = params.id;
    validateDateParameters(startDate, endDate);

    try {
        const metrics = await productsInteractionsService
            .getMetricsBetweenDatesAggDaily(new Date(startDate!), new Date(endDate!), brandId);

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