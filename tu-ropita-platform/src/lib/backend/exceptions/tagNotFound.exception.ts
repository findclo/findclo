import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class TagNotFoundException extends HttpException {
    constructor(brandId: string | number) {
        super(`Tag ${brandId} not found.`,404);
    }
}