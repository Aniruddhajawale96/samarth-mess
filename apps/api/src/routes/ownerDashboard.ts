import { Router, type NextFunction, type Request, type Response, type Router as ExpressRouter } from "express";
import { and, countDistinct, eq, gte, isNull, lte, or, sql, sum } from "drizzle-orm";
import { attendance, db, mealBookings, messes, payments, subscriptions, users } from "@samarth-mess/db";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";

export const ownerDashboardRouter: ExpressRouter = Router();

ownerDashboardRouter.get("/owner/dashboard", authenticate, requireRole("OWNER"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [mess] = await db.select().from(messes).where(eq(messes.ownerId, req.user.id)).limit(1);
    if (!mess) { next(createApiError("Mess not found", 404, "NOT_FOUND")); return; }
    const today = new Date().toISOString().slice(0, 10);
    const startOfToday = new Date(`${today}T00:00:00.000Z`);
    const [customerCounts, pendingApproval, activeCustomers, attendanceCounts, revenue] = await Promise.all([
      db.select({ total: countDistinct(subscriptions.userId) }).from(subscriptions).where(eq(subscriptions.messId, mess.id)),
      db.select({ total: countDistinct(subscriptions.id) }).from(subscriptions).where(and(eq(subscriptions.messId, mess.id), eq(subscriptions.status, "PENDING_APPROVAL"))),
      db.select({ total: countDistinct(subscriptions.userId) }).from(subscriptions).innerJoin(users, eq(users.id, subscriptions.userId)).where(and(eq(subscriptions.messId, mess.id), eq(subscriptions.status, "ACTIVE"), eq(users.status, "ACTIVE"), or(isNull(subscriptions.startDate), lte(subscriptions.startDate, startOfToday)), or(isNull(subscriptions.endDate), gte(subscriptions.endDate, startOfToday)))),
      db.select({ status: attendance.status, total: sql<number>`count(*)` }).from(attendance).where(and(eq(attendance.messId, mess.id), eq(attendance.date, today))).groupBy(attendance.status),
      db.select({ total: sum(payments.amount) }).from(payments).where(and(eq(payments.messId, mess.id), eq(payments.status, "SUCCESS")))
    ]);
    const counts = Object.fromEntries(attendanceCounts.map((row) => [row.status.toLowerCase(), Number(row.total)]));
    res.json({ success: true, data: {
      mess,
      customers: { total: Number(customerCounts[0]?.total ?? 0), active: Number(activeCustomers[0]?.total ?? 0), pendingApprovals: Number(pendingApproval[0]?.total ?? 0) },
      today: { date: today, expectedMeals: Number(activeCustomers[0]?.total ?? 0) * mess.mealsPerDay, present: counts.present ?? 0, absent: counts.absent ?? 0, extra: counts.extra ?? 0 },
      revenue: { successfulAmount: Number(revenue[0]?.total ?? 0), currency: "INR" },
      primaryActions: ["menu", "approvals", "customers", "attendance"]
    }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
