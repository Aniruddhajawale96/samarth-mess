import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";

export async function runMigrations() {
  console.log("[db] Running database migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
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
