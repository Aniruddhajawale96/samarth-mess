import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { createApiError } from "./errorHandler.js";

type RequestPart = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, part: RequestPart = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || part,
        message: issue.message,
        code: issue.code
      }));
      next(createApiError("Request validation failed", 400, "VALIDATION_ERROR", details));
      return;
    }
    Object.defineProperty(req, part, { value: result.data, writable: true, configurable: true });
    next();
  };
}
