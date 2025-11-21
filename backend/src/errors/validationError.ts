import { ApiError } from "./apiError.ts"

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, message, "VALIDATION_ERROR", details)
  }
}