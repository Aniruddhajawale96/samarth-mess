import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, messes, users } from "@samarth-mess/db";
import { AdminMessStatusSchema, AdminUserQuerySchema, CustomerStatusSchema, UserParamsSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { recordAudit } from "../lib/audit.js";

export const adminRouter: ExpressRouter = Router();

adminRouter.get("/admin/access", authenticate, requireRole("ADMIN"), (_req, res) => {
  res.json({ success: true, data: { role: "ADMIN" }, timestamp: new Date().toISOString() });
});

adminRouter.get("/admin/dashboard", authenticate, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const [[userCount], [ownerCount], [messCount], [pendingCount]] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.role, "USER"), eq(users.status, "ACTIVE"))),
      db.select({ count: sql<number>`count(*)` }).from(users).where(and(eq(users.role, "OWNER"), eq(users.status, "ACTIVE"))),
      db.select({ count: sql<number>`count(*)` }).from(messes),
      db.select({ count: sql<number>`count(*)` }).from(messes).where(eq(messes.status, "PENDING_APPROVAL"))
    ]);
    res.json({ success: true, data: { users: Number(userCount.count), owners: Number(ownerCount.count), messes: Number(messCount.count), pendingMesses: Number(pendingCount.count) }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

adminRouter.get("/admin/users", authenticate, requireRole("ADMIN"), validate(AdminUserQuerySchema, "query"), async (req: Request, res: Response, next) => {
  try {
    const query = req.query as unknown as { page: number; limit: number; search?: string; role: "USER" | "OWNER"; status?: "ACTIVE" | "DISABLED" };
    const filters = [eq(users.role, query.role)];
    if (query.search) filters.push(or(ilike(users.name, `%${query.search}%`), ilike(users.phone, `%${query.search}%`), ilike(users.email, `%${query.search}%`))!);
    if (query.status) filters.push(eq(users.status, query.status));
    const rows = await db.select({ user: users, ownedMess: messes }).from(users).leftJoin(messes, eq(messes.ownerId, users.id)).where(and(...filters)).orderBy(desc(users.createdAt)).limit(query.limit).offset((query.page - 1) * query.limit);
    res.json({ success: true, data: { items: rows.map(({ user, ownedMess }) => ({ user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, userType: user.userType, status: user.status, createdAt: user.createdAt }, mess: ownedMess })), page: query.page, limit: query.limit }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

adminRouter.get("/admin/messes", authenticate, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const items = await db.select({ mess: messes, owner: users }).from(messes).innerJoin(users, eq(users.id, messes.ownerId)).orderBy(desc(messes.createdAt)).limit(100);
    res.json({ success: true, data: { items }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

adminRouter.patch("/admin/users/:userId/status", authenticate, requireRole("ADMIN"), validate(UserParamsSchema, "params"), validate(CustomerStatusSchema), async (req: Request, res: Response, next) => {
  try {
    const [user] = await db.update(users).set({ status: (req.body as { status: "ACTIVE" | "DISABLED" }).status, updatedAt: new Date() }).where(and(eq(users.id, req.params.userId), or(eq(users.role, "USER"), eq(users.role, "OWNER")))).returning({ id: users.id, name: users.name, role: users.role, status: users.status });
    if (!user) { next(createApiError("Account not found", 404, "NOT_FOUND")); return; }
    await recordAudit({ actorId: req.user.id, actorRole: "ADMIN", action: `ACCOUNT_${user.status}`, entityType: "USER", entityId: user.id });
    res.json({ success: true, data: { user }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

adminRouter.patch("/admin/messes/:messId/status", authenticate, requireRole("ADMIN"), validate(AdminMessStatusSchema), async (req: Request, res: Response, next) => {
  try {
    const [mess] = await db.update(messes).set({ status: (req.body as { status: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL" }).status, updatedAt: new Date() }).where(eq(messes.id, req.params.messId)).returning();
    if (!mess) { next(createApiError("Mess not found", 404, "NOT_FOUND")); return; }
    await recordAudit({ actorId: req.user.id, actorRole: "ADMIN", action: `MESS_${mess.status}`, entityType: "MESS", entityId: mess.id });
    res.json({ success: true, data: { mess }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
