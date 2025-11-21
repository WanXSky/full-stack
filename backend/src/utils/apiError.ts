export class ApiError extends Error {
    statusCode: number;
    errorCode: string;
    details?: unknown
    constructor(statusCode: number, message: string, errorCode = "UNKNOWN_ERROR", details?: unknown) {
        super(message)
        this.statusCode = statusCode
        this.errorCode = errorCode
        this.details = details
    }
}