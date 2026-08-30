import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "@samarth-mess/config";
import * as schema from "./schema/index";

const { Pool } = pg;

const isSslRequired =
  config.database.url.includes("sslmode=require") ||
  config.database.url.includes("neon.tech") ||
  config.database.url.includes("ssl=true") ||
  config.isProduction;

export const pool = new Pool({
  connectionString: config.database.url,
  ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
export * from "./schema/index";
