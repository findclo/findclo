import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class ProductNotFoundException extends HttpException {
    constructor(productId: number) {
        super(`Product with ID ${productId} not found.`,404);
    }
}