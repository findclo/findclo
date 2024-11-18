import {withAdminPermissionNoParams} from "@/lib/routes_middlewares";
import {productsInteractionsService} from "@/lib/backend/services/productsInteractions.service";
import {BadRequestException} from "@/lib/backend/exceptions/BadRequestException";
import {parseErrorResponse, validateDateParameters} from "@/lib/utils";



export const POST = withAdminPermissionNoParams(async(req: Request) => {
    try{
        await productsInteractionsService.syncProductMetricsAggDaily();

        return new Response(JSON.stringify(""), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any){
        return parseErrorResponse(error)
    }
});

export const GET = withAdminPermissionNoParams(async (req: Request) => {
    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const productId = url.searchParams.get("productId");
    validateDateParameters(startDate, endDate);

    try {
        let metrics ;

        if(productId){
            metrics = await productsInteractionsService.getProductMetricsAggDaily(new Date(startDate!), new Date(endDate!),productId);
        }else{
            metrics = await productsInteractionsService.getMetricsBetweenDatesAggDaily(new Date(startDate!), new Date(endDate!));
        }

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


