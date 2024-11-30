import {billsService} from "@/lib/backend/services/bills.service";
import {withAdminPermissionNoParams} from "@/lib/routes_middlewares";

export const GET = withAdminPermissionNoParams(async (req: Request) => {
    try {
        const bills = await billsService.listBillsWithDetails();
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

export const POST = withAdminPermissionNoParams(async (req: Request) => {
    try {
         await billsService.generateBill();
        return new Response(JSON.stringify(null), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(null, {status: error.statusCode ? error.statusCode : 500});
    }
});
