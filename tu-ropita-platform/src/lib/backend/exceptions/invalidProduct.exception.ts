import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class InvalidProductException extends HttpException {
    constructor() {
        super(`Invalid product.`, 400);
    }
}