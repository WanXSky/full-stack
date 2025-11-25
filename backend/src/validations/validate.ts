import { NextFunction, Request, Response } from "express"
import { ZodSchema } from "zod"
import { fail } from "../utils/response"

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed:any  = schema.parse({
            body: req.body,
            params: req.params,
            query: req.query
        })
        req.body = parsed.body
        req.params = parsed.params
        req.query = parsed.query
        next()
    } catch(err: any) {
        console.error(err)
        fail(res, "Validation failed", 400, "BAD_REQUEST", err.error)
    }
}