interface IHttpException {
    statusCode: number;

    errorMessage: string;

    errorDetails?: string;
}
