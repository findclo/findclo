import {billsService} from "@/lib/backend/services/bills.service";

export async function GET(req: Request) {
    try {
        await billsService.generateBill();
        return new Response(JSON.stringify(""), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(null, {status: error.statusCode ? error.statusCode : 500});
    }

}
