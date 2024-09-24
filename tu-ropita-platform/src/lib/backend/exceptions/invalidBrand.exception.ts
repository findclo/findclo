import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class InvalidBrandException extends HttpException {
    constructor() {
        super(`Invalid brand.`, 400);
    }
}