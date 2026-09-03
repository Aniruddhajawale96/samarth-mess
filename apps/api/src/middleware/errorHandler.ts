/**
 * apps/api/src/middleware/errorHandler.ts
 *
 * Central error handler. All errors must produce one consistent JSON shape:
 *
 * {
 *   "success": false,
 *   "error": {
 *     "code": "INTERNAL_SERVER_ERROR",
 *     "message": "Something went wrong",
 *     "requestId": "<uuid>"
 *   }
 * }
 *
 * Stack traces are NEVER sent to clients.
 * Detailed errors are only logged server-side.
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function createApiError(
  message: string,
  statusCode: number,
  code: string,
  details?: unknown
): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
}

/** 404 handler — must be registered AFTER all routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
      requestId: req.requestId,
    },
  });
}

/** Central error handler — must be registered last (4-arg signature). */
export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? "INTERNAL_SERVER_ERROR";

  logger.error("unhandled_error", {
    requestId: req.requestId,
    code,
    statusCode,
    message: err.message,
    // Stack only in server logs, never in response
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message:
        statusCode === 500 ? "An unexpected error occurred" : err.message,
      ...(err.details === undefined ? {} : { details: err.details }),
      requestId: req.requestId,
    },
  });
}
