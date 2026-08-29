import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { db, mealBookings, messes, subscriptions } from "@samarth-mess/db";
import { BookingParamsSchema, BookingQuerySchema, BookingSchema, BookingUpdateSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { canSkip } from "../lib/booking.js";

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
