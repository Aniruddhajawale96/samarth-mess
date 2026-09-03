import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, pool } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsFolder = path.resolve(__dirname, "../drizzle");

export async function runMigrations() {
  console.log("[db] Running database migrations...");
  await migrate(db, { migrationsFolder });
  console.log("[db] Database migrations completed.");
}

if (process.env.RUN_MIGRATIONS === "true") {
  runMigrations()
    .then(() => pool.end())
    .catch((err) => {
      console.error("[db] Migration error:", err);
      process.exit(1);
    });
}
