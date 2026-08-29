/**
 * apps/api/src/app.ts
 *
 * Express app factory.
 * Separated from src/index.ts so the app can be imported in tests
 * without binding to a port.
 */

import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "@samarth-mess/config";

import { requestIdMiddleware } from "./middleware/requestId.js";
import { requestLoggerMiddleware } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { accessRouter } from "./routes/access.js";
import { messRouter } from "./routes/messes.js";
import path from "node:path";

export function createApp(): Express {
  const app = express();

  // ── Security ───────────────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ───────────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: config.server.frontendUrl,
      credentials: true,
    })
  );

  // ── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // ── Request ID ─────────────────────────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ── Structured request logging ─────────────────────────────────────────────
  app.use(requestLoggerMiddleware);
  app.use("/uploads", express.static(path.resolve("uploads")));

  // ── Routes ─────────────────────────────────────────────────────────────────
  app.use(healthRouter);
  app.use(authRouter);
  app.use(accessRouter);
  app.use(messRouter);

  // Future versioned routes will be mounted here:
  // app.use("/api/v1", v1Router);

  // ── 404 handler (after all routes) ────────────────────────────────────────
  app.use(notFoundHandler);

  // ── Central error handler (must be last, 4-arg) ────────────────────────────
  app.use(errorHandler);

  return app;
}
