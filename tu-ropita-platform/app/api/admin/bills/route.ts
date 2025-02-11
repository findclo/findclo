import {billsService} from "@/lib/backend/services/bills.service";
import {withAdminPermissionNoParams} from "@/lib/routes_middlewares";

export const GET = withAdminPermissionNoParams(async (req: Request) => {
    try {
        const url = new URL(req.url);
        const period = url.searchParams.get('period') || undefined;

        const bills = await billsService.listBillsWithDetails(period);
        return new Response(JSON.stringify(bills), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(null, {status: error.statusCode ? error.statusCode : 500});
    }
});

export const POST = (async (req: Request) => {
    try {
        
        return new Response(JSON.stringify(await billsService.generateBill()), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(null, {status: error.statusCode ? error.statusCode : 500});
    }
});

