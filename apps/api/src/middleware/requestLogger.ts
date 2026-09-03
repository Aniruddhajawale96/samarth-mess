/**
 * apps/api/src/middleware/requestLogger.ts
 *
 * Logs every request with method, path, status, duration and request ID.
 * NEVER logs request bodies or authorization headers to prevent secret leakage.
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
    };
    // Log slow requests (> 2s) or errors as warnings
    if (duration > 2000 || res.statusCode >= 500) {
      logger.warn("slow_request", logData);
    } else {
      logger.info("request", logData);
    }
  });

  next();
}
