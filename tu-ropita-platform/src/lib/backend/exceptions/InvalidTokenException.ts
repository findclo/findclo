import { StatusCodes } from "http-status-codes";
import { HttpException } from "./http.exception";

export class InvalidTokenException extends HttpException {

    constructor(message = "Invalid token.", status = StatusCodes.UNAUTHORIZED) {
        super(message, status);
        Object.setPrototypeOf(this, InvalidTokenException.prototype);
    }

    static createFromMessage(message: string): InvalidTokenException {
        return new InvalidTokenException(message);
      }

}