import { IBrand } from "@/lib/backend/models/interfaces/brand.interface";
import { brandService } from "@/lib/backend/services/brand.service";
import { userService } from "@/lib/backend/services/user.service";
import { withJwtAuth } from "@/lib/routes_middlewares";
import { getBrandDtoFromBody, parseErrorResponse } from "@/lib/utils";
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";

export async function GET(req: Request) {
    try {

        const brands : IBrand[] = await brandService.listBrands();
        return Response.json(brands, { status: 200 });

    } catch (error:any) {
        return parseErrorResponse(error);
    }

}

export const POST = withJwtAuth(async (req: Request) => {
    try {
        const user = (req as any).user;
        const brandDto : IBrandDto = await getBrandDtoFromBody(req);
        const brand: IBrand = await brandService.createBrand(brandDto);
        await userService.addBrandToUser(user.id, brand.id);
        return Response.json(brand, { status: 201 });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
});