import { Request, Response, NextFunction } from "express"
import { ApiError } from "../errors/ApiError"
import { Prisma } from "@prisma/client"

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("Error handled:", err)

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode,
      details: err.details || null,
    })
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Duplicate field value",
        errorCode: "DB_DUPLICATE",
        details: err.meta,
      })
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        errorCode: "DB_NOT_FOUND",
      })
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "Foreign key constraint failed",
        errorCode: "DB_FOREIGN_KEY_ERROR",
        details: err.meta,
      })
    }
  }
  
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Invalid data format",
      errorCode: "DB_VALIDATION_ERROR",
    })
  }
  
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errorCode: "SERVER_ERROR",
  })
}