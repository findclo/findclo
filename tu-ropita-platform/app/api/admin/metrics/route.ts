import {withAdminPermissionNoParams} from "@/lib/routes_middlewares";
import {productsInteractionsService} from "@/lib/backend/services/productsInteractions.service";
import {BadRequestException} from "@/lib/backend/exceptions/BadRequestException";

export const GET = withAdminPermissionNoParams(async (req: Request) => {
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

function validateDateParameters(startDateStr: string | null, endDateStr: string | null): void {
    if (!startDateStr || !endDateStr) {
        throw new BadRequestException("Missing startDate or endDate parameters");
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException("Invalid startDate or endDate format. Must be YYYY-MM-DD");
    }

    if (endDate < startDate) {
        throw new BadRequestException("endDate must be equal to or after startDate");
    }

}