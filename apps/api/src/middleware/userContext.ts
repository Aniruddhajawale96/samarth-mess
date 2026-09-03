/**
 * apps/api/src/middleware/userContext.ts
 *
 * Attaches a user-context drizzle instance to req.db that has request.jwt.claims
 * set, so Supabase RLS policies using auth.uid() evaluate correctly.
 *
 * This middleware MUST run AFTER authenticate (which sets req.user).
 * The connection is automatically released when the response finishes.
 */

import type { NextFunction, Request, Response } from "express";
import { createUserContext, releaseUserContext, type UserContext } from "@samarth-mess/db";
import { logger } from "../lib/logger.js";

declare global {
  namespace Express {
    interface Request {
      /** RLS-aware drizzle instance — only available after userContext middleware */
      userDb?: UserContext["userDb"];
    }
  }
}

export async function userContextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    // Not authenticated — skip RLS context setup. Routes that need it
    // will use the authenticate middleware which enforces auth separately.
    next();
    return;
  }

  try {
    const { client, userDb } = await createUserContext(req.user.id, req.user.role);
    req.userDb = userDb;

    // Release the connection when the response finishes
    _res.on("finish", () => {
      void releaseUserContext(client);
    });

    next();
  } catch (error) {
    logger.error("user_context_failed", {
      requestId: req.requestId,
      userId: req.user.id,
      error: (error as Error).message,
    });
    // Fall back to global db — RLS won't apply, but app still functions
    next();
  }
}
