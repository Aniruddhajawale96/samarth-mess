import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db, messes, payments, subscriptions, users } from "@samarth-mess/db";
import { MessParamsSchema, SubscriptionOptionsSchema } from "@samarth-mess/validation";
import { createApiError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { notify } from "../lib/notifications.js";
import { recordAudit } from "../lib/audit.js";

export const subscriptionRouter: ExpressRouter = Router();

const activeSubscriptionStates: Array<"PENDING_PAYMENT" | "PENDING_APPROVAL" | "ACTIVE"> = ["PENDING_PAYMENT", "PENDING_APPROVAL", "ACTIVE"];

subscriptionRouter.post("/messes/:messId/subscriptions", authenticate, requireRole("USER"), validate(MessParamsSchema, "params"), validate(SubscriptionOptionsSchema), async (req: Request, res: Response, next) => {
  try {
    const { messId } = req.params as { messId: string };
    const { autoRenew } = req.body as { autoRenew: boolean };
    const [mess] = await db.select().from(messes).where(and(eq(messes.id, messId), eq(messes.status, "ACTIVE"))).limit(1);
    if (!mess) { next(createApiError("Mess is unavailable", 400, "MESS_UNAVAILABLE")); return; }

    const existing = await db.select({ id: subscriptions.id, messId: subscriptions.messId, status: subscriptions.status })
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, req.user.id), inArray(subscriptions.status, activeSubscriptionStates)))
      .limit(1);
    if (existing.length > 0) {
      next(createApiError("An active or pending subscription already exists", 409, "DUPLICATE_SUBSCRIPTION"));
      return;
    }

    const result = await db.transaction(async (tx) => {
      const [subscription] = await tx.insert(subscriptions).values({ id: randomUUID(), userId: req.user.id, messId, autoRenew, status: "PENDING_PAYMENT" }).returning();
      const [payment] = await tx.insert(payments).values({ id: randomUUID(), userId: req.user.id, messId, subscriptionId: subscription.id, provider: "RAZORPAY", amount: mess.monthlyPrice, currency: "INR", status: "PENDING" }).returning();
      return { subscription, payment };
    });
    const [owner] = await db.select({ id: users.id, phone: users.phone, email: users.email }).from(users).where(eq(users.id, mess.ownerId)).limit(1);
    await recordAudit({ actorId: req.user.id, actorRole: "USER", action: "SUBSCRIPTION_REQUESTED", entityType: "SUBSCRIPTION", entityId: result.subscription.id, metadata: { messId } });
    if (owner) void notify({ event: "NEW_SUBSCRIPTION_REQUEST", recipientUserId: owner.id, recipient: owner.email ?? owner.phone, payload: { subscriptionId: result.subscription.id, messId: mess.id } });
    res.status(201).json({ success: true, data: { subscription: result.subscription, paymentIntent: { id: result.payment.id, amount: result.payment.amount, currency: result.payment.currency, status: result.payment.status, provider: result.payment.provider } }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

subscriptionRouter.get("/subscriptions/me", authenticate, requireRole("USER"), async (req: Request, res: Response, next) => {
  try {
    const rows = await db.select({ subscription: subscriptions, mess: messes }).from(subscriptions)
      .innerJoin(messes, eq(messes.id, subscriptions.messId))
      .where(eq(subscriptions.userId, req.user.id)).orderBy(desc(subscriptions.createdAt));
    res.json({ success: true, data: { items: rows }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
