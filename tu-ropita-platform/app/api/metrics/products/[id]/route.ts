import {parseErrorResponse} from "@/lib/utils";
import {productsInteractionsService} from "@/lib/backend/services/productsInteractions.service";
import {BadRequestException} from "@/lib/backend/exceptions/BadRequestException";

export async function POST(req: Request, {params}: {params: {id:string}}) {
    try {
        if(isNaN(Number(params.id))){
            throw new BadRequestException('Invalid brand ID');
        }

        productsInteractionsService.addProductNavigateToBrandSiteInteraction(params.id);

        return new Response(JSON.stringify(""), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}