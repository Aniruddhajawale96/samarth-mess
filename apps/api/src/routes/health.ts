/**
 * apps/api/src/routes/health.ts
 *
 * Health endpoints:
 *   GET /health          — simple liveness probe
 *   GET /api/v1/health   — versioned liveness probe
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { config } from "@samarth-mess/config";

export const healthRouter: IRouter = Router();

function healthResponse(req: Request, res: Response): void {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "samarth-mess-api",
      env: config.nodeEnv,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

healthRouter.get("/health", healthResponse);
healthRouter.get("/api/v1/health", healthResponse);
