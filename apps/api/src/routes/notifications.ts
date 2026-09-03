import { Router, type Request, type Router as ExpressRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, notificationAttempts } from "@samarth-mess/db";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";

export const notificationRouter: ExpressRouter = Router();

notificationRouter.get("/users/me/notifications", authenticate, requireRole("USER", "OWNER", "ADMIN"), async (req: Request, res, next) => {
  try {
    const items = await db.select().from(notificationAttempts).where(eq(notificationAttempts.recipientUserId, req.user.id)).orderBy(desc(notificationAttempts.createdAt)).limit(50);
    res.json({ success: true, data: { items }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

notificationRouter.get("/admin/notifications", authenticate, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const items = await db.select().from(notificationAttempts).orderBy(desc(notificationAttempts.createdAt)).limit(100);
    res.json({ success: true, data: { items }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
