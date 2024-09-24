import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class BrandAlreadyExistsException extends HttpException {
    constructor(brandName: string) {
        super(`Brand '${brandName}' already exists.`, 409);
    }
}