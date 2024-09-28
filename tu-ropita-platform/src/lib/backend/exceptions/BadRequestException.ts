import { StatusCodes } from "http-status-codes";
import { HttpException } from "./http.exception";

export class BadRequestException extends HttpException {

    constructor(message = "Bad request.", status = StatusCodes.BAD_REQUEST) {
        super(message, status);
        Object.setPrototypeOf(this, BadRequestException.prototype);
    }

    static createFromMessage(message: string): BadRequestException {
        return new BadRequestException(message);
    }

}