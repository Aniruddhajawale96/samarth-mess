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
    logger.info("request", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}
