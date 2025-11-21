import { ApiError } from "./apiError"

export class NotFoundError extends ApiError {
  constructor(entity = "Resource") {
    super(404, ` ${entity} Not Found`, "NOT_FOUND")
  }
}