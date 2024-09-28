import { StatusCodes } from "http-status-codes";
import { HttpException } from "./http.exception";

export class ConflictException extends HttpException {

    constructor(message = "Conflict.", status = StatusCodes.CONFLICT) {
        super(message, status);
        Object.setPrototypeOf(this, ConflictException.prototype);
    }

    static createFromMessage(message: string): ConflictException {
        return new ConflictException(message);
      }

}