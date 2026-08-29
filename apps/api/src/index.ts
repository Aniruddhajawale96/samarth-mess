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
  app.listen(config.server.port, () => {
    logger.info("server_started", {
      port: config.server.port,
      env: config.nodeEnv,
      apiUrl: config.server.apiUrl,
    });
  });
}

export default app;
