/**
 * apps/api/src/index.ts
 *
 * Entry point — loads config (fail-fast validation), then starts the server.
 */

// Config must be imported first — validates env and exits on failure.
import { config } from "@samarth-mess/config";
import { createApp } from "./app.js";
import { logger } from "./lib/logger.js";

const app = createApp();

if (config.nodeEnv !== "test") {
  const server = app.listen(config.server.port, () => {
    logger.info("server_started", {
      port: config.server.port,
      env: config.nodeEnv,
      apiUrl: config.server.apiUrl,
    });
  });

  // Graceful shutdown
  function shutdown(signal: string) {
    logger.info("shutdown_initiated", { signal });
    server.close(() => {
      logger.info("server_closed");
      process.exit(0);
    });
    // Force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
      logger.error("shutdown_forced", { signal });
      process.exit(1);
    }, 10_000).unref();
  }

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

export default app;
