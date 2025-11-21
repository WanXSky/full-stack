import { Response } from "express"

interface SuccessResponse<T> {
  success: true
  message: string
  data?: T
}

interface ErrorResponse {
  success: false
  message: string
  errorCode?: string
  details?: unknown 
}

export function ok<T>(res: Response, data?: T, message: "Success") {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    data,
  }
  return res.status(200).json(body)
}

export function created<T>(res: Response, data?: <T>, message = "Created") {
  const body: SuccessResponse<T> = {
    success: true,
    message,
    data,
  }
  return res.status(201).json(body)
}

export function fail<T>(res: Response, message: string, statusCode = 400, errorCode = "BAD_REQUEST", details?: unknown) {
  const body: ErrorResponse = {
    success: false,
    message,
    errorCode,
    details?,
  }
  return res.status(statusCode).json(body)
}