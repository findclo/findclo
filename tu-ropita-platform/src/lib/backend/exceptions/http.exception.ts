export class HttpException implements IHttpException{
    errorMessage: string;
    statusCode: number;

    constructor(errorMessage:string, statusCode:number) {
        this.errorMessage = errorMessage;
        this.statusCode = statusCode;
    }
}