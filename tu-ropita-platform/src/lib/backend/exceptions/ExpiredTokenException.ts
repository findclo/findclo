import { StatusCodes } from "http-status-codes";
import { HttpException } from "./http.exception";

export class ExpiredTokenException extends HttpException {

    constructor(message = "Expired token.", status = StatusCodes.FORBIDDEN) {
        super(message, status);
        Object.setPrototypeOf(this, ExpiredTokenException.prototype);
    }

    static createFromMessage(message: string): ExpiredTokenException {
        return new ExpiredTokenException(message);
      }

}