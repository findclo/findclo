import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class BrandNotFoundException extends HttpException {
    constructor(brandId: number) {
        super(`Brand with ID ${brandId} not found.`,404);
    }
}