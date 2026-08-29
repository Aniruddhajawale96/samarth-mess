import type { NextFunction, Request, Response } from "express";
import { db, users } from "@samarth-mess/db";
import { eq } from "drizzle-orm";
import { createApiError } from "./errorHandler.js";
import { getAccessToken, verifyToken } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      user: { id: string; role: "USER" | "OWNER" | "ADMIN" };
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = getAccessToken({ headers: req.headers, headersCookie: req.headers.cookie });
  const claims = token ? verifyToken(token) : null;
  if (!claims) {
    next(createApiError("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }
  try {
    const [user] = await db.select({ id: users.id, role: users.role, status: users.status }).from(users).where(eq(users.id, claims.sub)).limit(1);
    if (!user || user.status !== "ACTIVE") {
      next(createApiError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    next(error);
  }
}
