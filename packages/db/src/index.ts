import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "@samarth-mess/config";
import * as schema from "./schema/index";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl
});

export const db = drizzle(pool, { schema });
export * from "./schema/index";
