import { StatusCodes } from "http-status-codes";
import { HttpException } from "./http.exception";

export class NotFoundException extends HttpException {

    constructor(message = "Resource not found.", status = StatusCodes.NOT_FOUND) {
        super(message, status);
        Object.setPrototypeOf(this, NotFoundException.prototype);
    }

    static createFromMessage(message: string): NotFoundException {
        return new NotFoundException(message);
      }

}