/**
 * apps/api/src/index.ts
 *
 * API entry point.
 * Config is imported first so validation runs at startup and fails fast
 * before any other code runs.
 */

// Config must be loaded first — it validates env and exits on failure.
import { config } from "@samarth-mess/config";

import express, { type Express, type Request, type Response } from "express";
import cors from "cors";

const app: Express = express();

app.use(cors({ origin: config.server.frontendUrl }));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "samarth-mess-api",
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "samarth-mess-api",
    version: "v1",
    env: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

if (config.nodeEnv !== "test") {
  app.listen(config.server.port, () => {
    console.log(
      `[api] Samarth Mess API listening at http://localhost:${config.server.port}`
    );
  });
}

export default app;
