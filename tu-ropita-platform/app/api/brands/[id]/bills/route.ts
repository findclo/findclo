import {withBrandPermission} from "@/lib/routes_middlewares";
import {billsService} from "@/lib/backend/services/bills.service";

export const GET = withBrandPermission(async(req: Request, {params}: {params: {id:string}}) => {
    try{
        console.log("GET /brands/:id/status/bills ---------- ");
        const bills = await billsService.listBrandBillsWithDetails(params.id);

        return new Response(JSON.stringify(bills), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error: any){
        console.log(error)
        return new Response(null, {
            status: error.statusCode? error.statusCode : 500 ,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
});