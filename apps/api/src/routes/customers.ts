import { Router, type NextFunction, type Request, type Response, type Router as ExpressRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, messes, subscriptions, users } from "@samarth-mess/db";
import { CustomerStatusSchema, OwnerCustomerQuerySchema, UserParamsSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";

export const customerRouter: ExpressRouter = Router();

function publicCustomer(user: typeof users.$inferSelect) {
  return { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, userType: user.userType, profilePhotoUrl: user.profilePhotoUrl, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

async function ownerCustomer(ownerId: string, userId: string) {
  const [row] = await db.select({ user: users, mess: messes }).from(subscriptions)
    .innerJoin(users, eq(users.id, subscriptions.userId)).innerJoin(messes, eq(messes.id, subscriptions.messId))
    .where(and(eq(subscriptions.userId, userId), eq(messes.ownerId, ownerId), eq(users.role, "USER"))).limit(1);
  return row;
}

customerRouter.get("/owner/customers", authenticate, requireRole("OWNER"), validate(OwnerCustomerQuerySchema, "query"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query as unknown as { page: number; limit: number; search?: string; status?: "ACTIVE" | "DISABLED" };
    const filters = [eq(messes.ownerId, req.user.id), eq(users.role, "USER")];
    if (query.search) filters.push(or(ilike(users.name, `%${query.search}%`), ilike(users.phone, `%${query.search}%`), ilike(users.email, `%${query.search}%`))!);
    if (query.status) filters.push(eq(users.status, query.status));
    const rows = await db.select({ user: users, subscription: subscriptions, mess: messes }).from(subscriptions)
      .innerJoin(users, eq(users.id, subscriptions.userId)).innerJoin(messes, eq(messes.id, subscriptions.messId))
      .where(and(...filters)).orderBy(desc(subscriptions.createdAt));
    const unique = new Map<string, { user: ReturnType<typeof publicCustomer>; subscription: typeof rows[number]["subscription"]; mess: typeof rows[number]["mess"] }>();
    for (const row of rows) if (!unique.has(row.user.id)) unique.set(row.user.id, { user: publicCustomer(row.user), subscription: row.subscription, mess: row.mess });
    const items = [...unique.values()];
    const offset = (query.page - 1) * query.limit;
    res.json({ success: true, data: { items: items.slice(offset, offset + query.limit), page: query.page, limit: query.limit, total: items.length }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

customerRouter.get("/owner/customers/:userId", authenticate, requireRole("OWNER"), validate(UserParamsSchema, "params"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await ownerCustomer(req.user.id, req.params.userId);
    if (!row) { next(createApiError("Customer not found", 404, "NOT_FOUND")); return; }
    const customerSubscriptions = await db.select({ subscription: subscriptions, mess: messes }).from(subscriptions).innerJoin(messes, eq(messes.id, subscriptions.messId)).where(and(eq(subscriptions.userId, req.params.userId), eq(messes.ownerId, req.user.id))).orderBy(desc(subscriptions.createdAt));
    res.json({ success: true, data: { user: publicCustomer(row.user), subscriptions: customerSubscriptions }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

customerRouter.patch("/owner/customers/:userId/status", authenticate, requireRole("OWNER"), validate(UserParamsSchema, "params"), validate(CustomerStatusSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await ownerCustomer(req.user.id, req.params.userId);
    if (!row) { next(createApiError("Customer not found", 404, "NOT_FOUND")); return; }
    const [user] = await db.update(users).set({ status: (req.body as { status: "ACTIVE" | "DISABLED" }).status, updatedAt: new Date() }).where(eq(users.id, req.params.userId)).returning();
    res.json({ success: true, data: { user: publicCustomer(user) }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
