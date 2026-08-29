import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { config } from "@samarth-mess/config";
import { db, paymentWebhookEvents, payments, subscriptions } from "@samarth-mess/db";
import { PaymentInitiationSchema, PaymentParamsSchema, PaymentVerificationSchema, PaymentWebhookSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";

export const paymentRouter: ExpressRouter = Router();

function signatureMatches(payload: Buffer | string, signature: string, secret: string): boolean {
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

async function markPaymentSuccessful(paymentId: string, providerPaymentId: string, providerOrderId: string) {
  return db.transaction(async (tx) => {
    const [payment] = await tx.update(payments).set({ providerPaymentId, providerOrderId, status: "SUCCESS", paidAt: new Date(), updatedAt: new Date() }).where(eq(payments.id, paymentId)).returning();
    if (!payment) return undefined;
    if (payment.subscriptionId) {
      await tx.update(subscriptions).set({ status: "PENDING_APPROVAL", updatedAt: new Date() }).where(and(eq(subscriptions.id, payment.subscriptionId), eq(subscriptions.status, "PENDING_PAYMENT")));
    }
    return payment;
  });
}

paymentRouter.post("/payments", authenticate, requireRole("USER"), validate(PaymentInitiationSchema), async (req: Request, res: Response, next) => {
  try {
    const { subscriptionId } = req.body as { subscriptionId: string };
    const [payment] = await db.select().from(payments).where(and(eq(payments.subscriptionId, subscriptionId), eq(payments.userId, req.user.id))).limit(1);
    if (!payment) { next(createApiError("Payment request not found", 404, "NOT_FOUND")); return; }
    if (payment.status !== "PENDING") { next(createApiError("Payment request is no longer pending", 409, "PAYMENT_NOT_PENDING")); return; }
    const providerOrderId = payment.providerOrderId ?? `order_${randomUUID().replaceAll("-", "")}`;
    const [updated] = await db.update(payments).set({ providerOrderId, updatedAt: new Date() }).where(eq(payments.id, payment.id)).returning();
    res.status(201).json({ success: true, data: { payment: { id: updated.id, status: updated.status, amount: updated.amount, currency: updated.currency, provider: updated.provider, providerOrderId: updated.providerOrderId }, provider: { keyId: config.payment.razorpayKeyId ?? null, orderId: updated.providerOrderId } }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

paymentRouter.post("/payments/:paymentId/verify", authenticate, requireRole("USER"), validate(PaymentParamsSchema, "params"), validate(PaymentVerificationSchema), async (req: Request, res: Response, next) => {
  try {
    const [payment] = await db.select().from(payments).where(and(eq(payments.id, req.params.paymentId), eq(payments.userId, req.user.id))).limit(1);
    if (!payment) { next(createApiError("Payment not found", 404, "NOT_FOUND")); return; }
    const input = req.body as { providerPaymentId: string; providerOrderId: string; signature: string };
    if (payment.providerOrderId !== input.providerOrderId || !signatureMatches(`${input.providerOrderId}|${input.providerPaymentId}`, input.signature, config.payment.razorpayKeySecret ?? "")) {
      next(createApiError("Payment verification failed", 400, "PAYMENT_VERIFICATION_FAILED"));
      return;
    }
    const updated = await markPaymentSuccessful(payment.id, input.providerPaymentId, input.providerOrderId);
    res.json({ success: true, data: { payment: updated, subscriptionStatus: "PENDING_APPROVAL" }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

paymentRouter.post("/webhooks/payment", validate(PaymentWebhookSchema), async (req: Request, res: Response, next) => {
  const signatureHeader = req.headers["x-razorpay-signature"];
  const signature = typeof signatureHeader === "string" ? signatureHeader : undefined;
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));
  if (!signature || !signatureMatches(rawBody, signature, config.payment.razorpayKeySecret ?? "")) {
    next(createApiError("Invalid webhook signature", 400, "INVALID_WEBHOOK_SIGNATURE"));
    return;
  }
  try {
    const input = req.body as { eventId: string; event: "payment.captured" | "payment.failed"; payment: { id: string; orderId?: string; status: "captured" | "failed"; amount?: number } };
    const [existingEvent] = await db.select({ id: paymentWebhookEvents.id }).from(paymentWebhookEvents).where(eq(paymentWebhookEvents.providerEventId, input.eventId)).limit(1);
    if (existingEvent) { res.json({ success: true, data: { duplicate: true }, timestamp: new Date().toISOString() }); return; }
    await db.transaction(async (tx) => {
      await tx.insert(paymentWebhookEvents).values({ id: randomUUID(), providerEventId: input.eventId, providerPaymentId: input.payment.id, event: input.event, payload: input as unknown as Record<string, unknown> });
      const [payment] = await tx.select().from(payments).where(or(eq(payments.providerPaymentId, input.payment.id), input.payment.orderId ? eq(payments.providerOrderId, input.payment.orderId) : undefined)).limit(1);
      if (!payment) return;
      if (input.payment.amount !== undefined && input.payment.amount !== payment.amount) throw createApiError("Webhook payment amount does not match", 400, "PAYMENT_AMOUNT_MISMATCH");
      const status = input.event === "payment.captured" && input.payment.status === "captured" ? "SUCCESS" : "FAILED";
      await tx.update(payments).set({ providerPaymentId: input.payment.id, providerOrderId: input.payment.orderId ?? payment.providerOrderId, status, paidAt: status === "SUCCESS" ? new Date() : null, updatedAt: new Date() }).where(eq(payments.id, payment.id));
      if (status === "SUCCESS" && payment.subscriptionId) {
        await tx.update(subscriptions).set({ status: "PENDING_APPROVAL", updatedAt: new Date() }).where(and(eq(subscriptions.id, payment.subscriptionId), eq(subscriptions.status, "PENDING_PAYMENT")));
      }
    });
    res.json({ success: true, data: { processed: true }, timestamp: new Date().toISOString() });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") { res.json({ success: true, data: { duplicate: true }, timestamp: new Date().toISOString() }); return; }
    next(error);
  }
});
