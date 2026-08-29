import type { NextFunction, Request, Response } from "express";
import { db, messes, menus } from "@samarth-mess/db";
import { and, eq } from "drizzle-orm";
import { createApiError } from "./errorHandler.js";

type Role = "USER" | "OWNER" | "ADMIN";

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createApiError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(createApiError("You do not have permission to perform this action", 403, "FORBIDDEN"));
      return;
    }
    next();
  };
}

export function requireMessOwner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(createApiError("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }
  if (req.user.role !== "OWNER") {
    next(createApiError("You do not have permission to perform this action", 403, "FORBIDDEN"));
    return;
  }

  const messId = typeof req.params.messId === "string" ? req.params.messId : undefined;
  if (!messId) {
    next(createApiError("Mess ID is required", 400, "VALIDATION_ERROR"));
    return;
  }

  void db.select({ id: messes.id, ownerId: messes.ownerId }).from(messes)
    .where(eq(messes.id, messId))
    .limit(1)
    .then(([mess]) => {
      // Do not distinguish a missing mess from another owner's mess.
      if (!mess) {
        next(createApiError("You do not have access to this mess", 403, "FORBIDDEN"));
        return;
      }
      if (mess.ownerId !== req.user.id) {
        next(createApiError("You do not have access to this mess", 403, "FORBIDDEN"));
        return;
      }
      next();
    })
    .catch(next);
}

export function requireMenuOwner(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(createApiError("Authentication required", 401, "UNAUTHORIZED"));
    return;
  }
  if (req.user.role !== "OWNER") {
    next(createApiError("You do not have permission to perform this action", 403, "FORBIDDEN"));
    return;
  }
  const menuId = typeof req.params.menuId === "string" ? req.params.menuId : undefined;
  if (!menuId) {
    next(createApiError("Menu ID is required", 400, "VALIDATION_ERROR"));
    return;
  }
  void db.select({ id: menus.id }).from(menus)
    .innerJoin(messes, eq(messes.id, menus.messId))
    .where(and(eq(menus.id, menuId), eq(messes.ownerId, req.user.id)))
    .limit(1)
    .then(([menu]) => {
      if (!menu) {
        next(createApiError("You do not have access to this menu", 403, "FORBIDDEN"));
        return;
      }
      next();
    })
    .catch(next);
}
