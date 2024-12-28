import { billsService } from "@/lib/backend/services/bills.service";
import { withAdminPermission } from "@/lib/routes_middlewares";

export const PUT = withAdminPermission(async (req: Request, params) => {
    try {
        const billId = params.params.id;
        await billsService.changeBillStatus(billId);
        return new Response(null, {
            status: 204,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(null, {status: error.statusCode ? error.statusCode : 500});
    }
});