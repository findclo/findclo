import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class CategoryNotFoundException extends HttpException {
    constructor(category: string | number) {
        super(`Category ${category} not found.`,404);
    }
}