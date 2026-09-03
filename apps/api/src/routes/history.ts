import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { attendance, db, invoices, mealBookings, messes, payments, subscriptions } from "@samarth-mess/db";
import { HistoryQuerySchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

export const historyRouter: ExpressRouter = Router();

historyRouter.get("/users/me/history", authenticate, requireRole("USER", "OWNER", "ADMIN"), validate(HistoryQuerySchema, "query"), async (req: Request, res: Response, next: (error?: unknown) => void) => {
  try {
    const query = req.query as unknown as { page: number; limit: number };
    const offset = (query.page - 1) * query.limit;
    const [bookings, attendanceRecords, paymentRecords, subscriptionRecords] = await Promise.all([
      db.select().from(mealBookings).where(eq(mealBookings.userId, req.user.id)).orderBy(desc(mealBookings.date), desc(mealBookings.createdAt)).limit(query.limit).offset(offset),
      db.select().from(attendance).where(eq(attendance.userId, req.user.id)).orderBy(desc(attendance.date), desc(attendance.updatedAt)).limit(query.limit).offset(offset),
      db.select({ payment: payments, mess: messes, invoice: invoices }).from(payments).innerJoin(messes, eq(messes.id, payments.messId)).leftJoin(invoices, eq(invoices.paymentId, payments.id)).where(eq(payments.userId, req.user.id)).orderBy(desc(payments.createdAt)).limit(query.limit).offset(offset),
      db.select({ subscription: subscriptions, mess: messes }).from(subscriptions).innerJoin(messes, eq(messes.id, subscriptions.messId)).where(eq(subscriptions.userId, req.user.id)).orderBy(desc(subscriptions.createdAt)).limit(query.limit).offset(offset)
    ]);
    res.json({ success: true, data: { page: query.page, limit: query.limit, bookings, attendance: attendanceRecords, payments: paymentRecords, subscriptions: subscriptionRecords }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
