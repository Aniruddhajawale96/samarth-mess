/**
 * apps/api/src/middleware/requestId.ts
 *
 * Attaches a unique request/correlation ID to every incoming request.
 * The ID is:
 *  - read from the X-Request-ID header if present (forwarded by load balancers)
 *  - generated fresh with UUID v4 otherwise
 *
 * The resolved ID is written back on the response as X-Request-ID.
 */

import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  // Augment Express Request so downstream handlers get typed requestId
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const existing = req.headers["x-request-id"];
  const id =
    typeof existing === "string" && existing.length > 0
      ? existing
      : randomUUID();

  req.requestId = id;
  res.setHeader("X-Request-ID", id);
  next();
}
