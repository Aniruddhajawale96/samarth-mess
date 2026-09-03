import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "@samarth-mess/config";
import * as schema from "./schema/index";

const { Pool } = pg;

const isSslRequired =
  config.database.url.includes("sslmode=require") ||
  config.database.url.includes("neon.tech") ||
  config.database.url.includes("supabase.com") ||
  config.database.url.includes("ssl=true") ||
  config.isProduction;

export const pool = new Pool({
  connectionString: config.database.url,
  ssl: isSslRequired ? { rejectUnauthorized: false } : undefined,
});

// ── Type alias for our schema-aware drizzle instance ─────────────────────────
// Used by both the service-role db and user-context db so they share a type.
export type Database = ReturnType<typeof drizzle<typeof schema>>;

// ── Default db (service role context — no RLS restrictions) ──────────────────
// Use this for admin operations, background jobs, and service-to-service calls.
export const db: Database = drizzle(pool, { schema });

// ── User-context db (RLS-aware) ─────────────────────────────────────────────
// Creates a dedicated connection with request.jwt.claims set so that
// Supabase RLS policies using auth.uid() evaluate correctly.
//
// Usage:
//   const { client, userDb } = await createUserContext(userId, role);
//   try {
//     const result = await userDb.select().from(users);
//   } finally {
//     releaseUserContext(client);
//   }

export interface UserContext {
  client: pg.PoolClient;
  userDb: Database;
}

/**
 * Check out a dedicated pg client and set request.jwt.claims so that
 * Supabase's auth.uid() returns the correct user ID in RLS policies.
 *
 * @param userId - The user's ID (must match the sub claim)
 * @param role   - The user's role (USER, OWNER, ADMIN)
 * @returns A drizzle instance bound to this connection with JWT claims set
 */
export async function createUserContext(
  userId: string,
  role: "USER" | "OWNER" | "ADMIN"
): Promise<UserContext> {
  const client = await pool.connect();

  // Set the JWT claims that Supabase's auth.uid() reads from.
  // auth.uid() extracts the "sub" field from this JSON.
  const claims = JSON.stringify({
    sub: userId,
    role: role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  await client.query(`SET request.jwt.claims = '${claims.replace(/'/g, "''")}'`);

  const userDb = drizzle(client, { schema }) as unknown as Database;

  return { client, userDb };
}

/**
 * Release a user-context connection back to the pool.
 * Always call this in a finally block to prevent connection leaks.
 */
export async function releaseUserContext(client: pg.PoolClient): Promise<void> {
  try {
    await client.query("RESET request.jwt.claims");
  } finally {
    client.release();
  }
}

export * from "./schema/index";
