import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, mealBookings, messes, subscriptions, users } from "@samarth-mess/db";
import { BookingParamsSchema, BookingQuerySchema, BookingSchema, BookingUpdateSchema, ExtraMealSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { canSkip } from "../lib/booking.js";
import { recordAudit } from "../lib/audit.js";

export const bookingRouter: ExpressRouter = Router();

async function activeSubscriptionForDate(userId: string, messId: string, date: string) {
  const [subscription] = await db.select().from(subscriptions).where(and(eq(subscriptions.userId, userId), eq(subscriptions.messId, messId), eq(subscriptions.status, "ACTIVE"))).limit(1);
  if (!subscription) return undefined;
  const day = new Date(`${date}T00:00:00.000Z`);
  return (!subscription.startDate || subscription.startDate <= day) && (!subscription.endDate || subscription.endDate >= day) ? subscription : undefined;
}

async function validateBookingAccess(userId: string, messId: string, date: string) {
  const [mess] = await db.select().from(messes).where(and(eq(messes.id, messId), eq(messes.status, "ACTIVE"))).limit(1);
  if (!mess) throw createApiError("Mess is unavailable", 400, "MESS_UNAVAILABLE");
  const subscription = await activeSubscriptionForDate(userId, messId, date);
  if (!subscription) throw createApiError("An active subscription is required to book meals", 403, "ACTIVE_SUBSCRIPTION_REQUIRED");
  return mess;
}

bookingRouter.post("/bookings", authenticate, requireRole("USER"), validate(BookingSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as typeof BookingSchema._type;
    const mess = await validateBookingAccess(req.user.id, input.messId, input.date);
    if (input.status === "SKIPPED" && !canSkip(input.date, input.mealType, mess.skipCutoffMinutes)) {
      next(createApiError("This meal can no longer be skipped", 409, "SKIP_CUTOFF_PASSED"));
      return;
    }
    const [booking] = await db.insert(mealBookings).values({ id: randomUUID(), userId: req.user.id, messId: input.messId, date: input.date, mealType: input.mealType, status: input.status }).onConflictDoUpdate({
      target: [mealBookings.userId, mealBookings.date, mealBookings.mealType],
      set: { status: input.status, messId: input.messId, updatedAt: new Date() }
    }).returning();
    await recordAudit({ actorId: req.user.id, actorRole: "USER", action: "BOOKING_CHANGED", entityType: "MEAL_BOOKING", entityId: booking.id, metadata: { status: booking.status, messId: booking.messId, date: booking.date, mealType: booking.mealType } });
    res.status(201).json({ success: true, data: { booking }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

bookingRouter.patch("/bookings/:bookingId", authenticate, requireRole("USER"), validate(BookingParamsSchema, "params"), validate(BookingUpdateSchema), async (req: Request, res: Response, next) => {
  try {
    const [booking] = await db.select().from(mealBookings).where(and(eq(mealBookings.id, req.params.bookingId), eq(mealBookings.userId, req.user.id))).limit(1);
    if (!booking) { next(createApiError("Booking not found", 404, "NOT_FOUND")); return; }
    if (booking.status === "SKIPPED" && (req.body as { status: string }).status !== "SKIPPED" && !canSkip(booking.date, booking.mealType, (await db.select({ skipCutoffMinutes: messes.skipCutoffMinutes }).from(messes).where(eq(messes.id, booking.messId)).limit(1))[0]?.skipCutoffMinutes ?? 120)) {
      next(createApiError("This meal can no longer be changed", 409, "SKIP_CUTOFF_PASSED"));
      return;
    }
    if ((req.body as { status: string }).status === "SKIPPED") {
      const [mess] = await db.select({ skipCutoffMinutes: messes.skipCutoffMinutes }).from(messes).where(eq(messes.id, booking.messId)).limit(1);
      if (!canSkip(booking.date, booking.mealType, mess?.skipCutoffMinutes ?? 120)) { next(createApiError("This meal can no longer be skipped", 409, "SKIP_CUTOFF_PASSED")); return; }
    }
    const [updated] = await db.update(mealBookings).set({ status: (req.body as { status: "BOOKED" | "SKIPPED" | "CANCELLED" }).status, updatedAt: new Date() }).where(eq(mealBookings.id, booking.id)).returning();
    await recordAudit({ actorId: req.user.id, actorRole: "USER", action: "BOOKING_CHANGED", entityType: "MEAL_BOOKING", entityId: updated.id, metadata: { from: booking.status, status: updated.status } });
    res.json({ success: true, data: { booking: updated }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

bookingRouter.get("/bookings", authenticate, requireRole("USER"), validate(BookingQuerySchema, "query"), async (req: Request, res: Response, next) => {
  try {
    const query = req.query as unknown as { page: number; limit: number; date?: string };
    const filters = [eq(mealBookings.userId, req.user.id)];
    if (query.date) filters.push(eq(mealBookings.date, query.date));
    const rows = await db.select().from(mealBookings).where(and(...filters)).orderBy(desc(mealBookings.date), desc(mealBookings.createdAt)).limit(query.limit).offset((query.page - 1) * query.limit);
    res.json({ success: true, data: { items: rows, page: query.page, limit: query.limit }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

bookingRouter.post("/extra-meals", authenticate, requireRole("USER"), validate(ExtraMealSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as { messId: string; date: string; mealType: "BREAKFAST" | "LUNCH" | "DINNER" };
    await validateBookingAccess(req.user.id, input.messId, input.date);
    const [booking] = await db.insert(mealBookings).values({ id: randomUUID(), userId: req.user.id, messId: input.messId, date: input.date, mealType: input.mealType, status: "EXTRA" }).onConflictDoUpdate({
      target: [mealBookings.userId, mealBookings.date, mealBookings.mealType],
      set: { status: "EXTRA", messId: input.messId, updatedAt: new Date() }
    }).returning();
    await recordAudit({ actorId: req.user.id, actorRole: "USER", action: "BOOKING_CHANGED", entityType: "MEAL_BOOKING", entityId: booking.id, metadata: { status: booking.status, messId: booking.messId, date: booking.date, mealType: booking.mealType } });
    res.status(201).json({ success: true, data: { booking }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

bookingRouter.get("/owner/extra-meals", authenticate, requireRole("OWNER"), async (req: Request, res: Response, next) => {
  try {
    const rows = await db.select({ booking: mealBookings, user: { id: users.id, name: users.name, phone: users.phone }, mess: messes })
      .from(mealBookings)
      .innerJoin(users, eq(users.id, mealBookings.userId))
      .innerJoin(messes, eq(messes.id, mealBookings.messId))
      .where(and(eq(mealBookings.status, "EXTRA"), eq(messes.ownerId, req.user.id)))
      .orderBy(desc(mealBookings.date), desc(mealBookings.createdAt));
    res.json({ success: true, data: { items: rows }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
