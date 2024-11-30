import {withAdminPermission, withAdminPermissionNoParams} from "@/lib/routes_middlewares";
import {billsService} from "@/lib/backend/services/bills.service";

export const PUT = withAdminPermission(async (req: Request, params) => {
    try {
        const billId = params.params.id;
        const bills = await billsService.changeBillStatus(billId);
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