import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, messes, subscriptions, users } from "@samarth-mess/db";
import { SubscriptionParamsSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";

export const approvalRouter: ExpressRouter = Router();

async function ownerSubscription(req: Request, subscriptionId: string) {
  const [row] = await db.select({ subscription: subscriptions, user: users, mess: messes }).from(subscriptions)
    .innerJoin(messes, eq(messes.id, subscriptions.messId))
    .innerJoin(users, eq(users.id, subscriptions.userId))
    .where(and(eq(subscriptions.id, subscriptionId), eq(messes.ownerId, req.user.id)))
    .limit(1);
  return row;
}

approvalRouter.get("/owner/subscriptions/pending", authenticate, requireRole("OWNER"), async (req: Request, res: Response, next) => {
  try {
    const rows = await db.select({ subscription: subscriptions, user: { id: users.id, name: users.name, phone: users.phone, email: users.email }, mess: messes }).from(subscriptions)
      .innerJoin(messes, eq(messes.id, subscriptions.messId))
      .innerJoin(users, eq(users.id, subscriptions.userId))
      .where(and(eq(messes.ownerId, req.user.id), eq(subscriptions.status, "PENDING_APPROVAL")))
      .orderBy(desc(subscriptions.createdAt));
    res.json({ success: true, data: { items: rows }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

approvalRouter.post("/owner/subscriptions/:subscriptionId/approve", authenticate, requireRole("OWNER"), validate(SubscriptionParamsSchema, "params"), async (req: Request, res: Response, next) => {
  try {
    const row = await ownerSubscription(req, req.params.subscriptionId);
    if (!row) { next(createApiError("Subscription not found", 404, "NOT_FOUND")); return; }
    if (row.subscription.status !== "PENDING_APPROVAL") { next(createApiError("Subscription is not awaiting approval", 409, "INVALID_SUBSCRIPTION_STATE")); return; }
    const [subscription] = await db.update(subscriptions).set({ status: "ACTIVE", startDate: new Date(), updatedAt: new Date() }).where(and(eq(subscriptions.id, row.subscription.id), eq(subscriptions.status, "PENDING_APPROVAL"))).returning();
    res.json({ success: true, data: { subscription }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

approvalRouter.post("/owner/subscriptions/:subscriptionId/reject", authenticate, requireRole("OWNER"), validate(SubscriptionParamsSchema, "params"), async (req: Request, res: Response, next) => {
  try {
    const row = await ownerSubscription(req, req.params.subscriptionId);
    if (!row) { next(createApiError("Subscription not found", 404, "NOT_FOUND")); return; }
    if (row.subscription.status !== "PENDING_APPROVAL") { next(createApiError("Subscription is not awaiting approval", 409, "INVALID_SUBSCRIPTION_STATE")); return; }
    const [subscription] = await db.update(subscriptions).set({ status: "REJECTED", updatedAt: new Date() }).where(and(eq(subscriptions.id, row.subscription.id), eq(subscriptions.status, "PENDING_APPROVAL"))).returning();
    res.json({ success: true, data: { subscription }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

approvalRouter.get("/subscriptions/:subscriptionId", authenticate, requireRole("USER"), validate(SubscriptionParamsSchema, "params"), async (req: Request, res: Response, next) => {
  try {
    const [row] = await db.select({ subscription: subscriptions, mess: messes }).from(subscriptions).innerJoin(messes, eq(messes.id, subscriptions.messId)).where(and(eq(subscriptions.id, req.params.subscriptionId), eq(subscriptions.userId, req.user.id))).limit(1);
    if (!row) { next(createApiError("Subscription not found", 404, "NOT_FOUND")); return; }
    res.json({ success: true, data: row, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
