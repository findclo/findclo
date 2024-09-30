import {HttpException} from "@/lib/backend/exceptions/http.exception";

export class UnauthorizedException extends HttpException {

    constructor() {
        super("Unauthorized", 401);
        Object.setPrototypeOf(this, UnauthorizedException.prototype);
    }

}