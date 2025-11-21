export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode: string,
    public details?: any
    ) {
      super(message)
    }
}