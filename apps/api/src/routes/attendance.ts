import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, isNull, lte, or } from "drizzle-orm";
import { attendance, db, messes, subscriptions, users } from "@samarth-mess/db";
import { AttendanceBatchSchema, AttendanceQuerySchema, QrAttendanceSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";

export const attendanceRouter: ExpressRouter = Router();

function dateValue(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

async function ownerMess(ownerId: string, messId: string) {
  const [mess] = await db.select().from(messes).where(and(eq(messes.id, messId), eq(messes.ownerId, ownerId), eq(messes.status, "ACTIVE"))).limit(1);
  if (!mess) throw createApiError("You do not have access to this mess", 403, "FORBIDDEN");
  return mess;
}

async function activeSubscription(userId: string, messId: string, date: string) {
  const day = dateValue(date);
  const [subscription] = await db.select().from(subscriptions).where(and(
    eq(subscriptions.userId, userId),
    eq(subscriptions.messId, messId),
    eq(subscriptions.status, "ACTIVE"),
    or(isNull(subscriptions.startDate), lte(subscriptions.startDate, day)),
    or(isNull(subscriptions.endDate), gte(subscriptions.endDate, day))
  )).limit(1);
  return subscription;
}

async function assertCustomer(userId: string, messId: string, date: string) {
  const [user] = await db.select({ id: users.id, status: users.status }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user || user.status !== "ACTIVE") throw createApiError("Customer is unavailable", 400, "INVALID_CUSTOMER");
  if (!await activeSubscription(userId, messId, date)) throw createApiError("Customer does not have an active subscription", 403, "ACTIVE_SUBSCRIPTION_REQUIRED");
}

async function upsertAttendance(input: { userId: string; messId: string; date: string; mealType: "BREAKFAST" | "LUNCH" | "DINNER"; status: "PRESENT" | "ABSENT" | "EXTRA"; method: "QR" | "MANUAL"; markedBy: string }) {
  const [record] = await db.insert(attendance).values({ id: randomUUID(), ...input }).onConflictDoUpdate({
    target: [attendance.userId, attendance.messId, attendance.date, attendance.mealType],
    set: { status: input.status, method: input.method, markedBy: input.markedBy, updatedAt: new Date() }
  }).returning();
  return record;
}

attendanceRouter.get("/owner/attendance", authenticate, requireRole("OWNER"), validate(AttendanceQuerySchema, "query"), async (req: Request, res: Response, next) => {
  try {
    const query = req.query as { messId?: string; date?: string };
    const date = query.date ?? new Date().toISOString().slice(0, 10);
    const [mess] = query.messId
      ? [await ownerMess(req.user.id, query.messId)]
      : await db.select().from(messes).where(and(eq(messes.ownerId, req.user.id), eq(messes.status, "ACTIVE"))).limit(1);
    if (!mess) { next(createApiError("Mess not found", 404, "NOT_FOUND")); return; }
    const customers = await db.select({ subscription: subscriptions, user: { id: users.id, name: users.name, phone: users.phone, email: users.email } })
      .from(subscriptions).innerJoin(users, eq(users.id, subscriptions.userId))
      .where(and(eq(subscriptions.messId, mess.id), eq(subscriptions.status, "ACTIVE"), eq(users.status, "ACTIVE"),
        or(isNull(subscriptions.startDate), lte(subscriptions.startDate, dateValue(date))),
        or(isNull(subscriptions.endDate), gte(subscriptions.endDate, dateValue(date)))));
    const records = await db.select().from(attendance).where(and(eq(attendance.messId, mess.id), eq(attendance.date, date))).orderBy(desc(attendance.updatedAt));
    res.json({ success: true, data: { mess, date, customers, attendance: records }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

attendanceRouter.post("/owner/attendance/manual", authenticate, requireRole("OWNER"), validate(AttendanceBatchSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as { messId: string; date: string; records: Array<{ userId: string; mealType: "BREAKFAST" | "LUNCH" | "DINNER"; status: "PRESENT" | "ABSENT" | "EXTRA" }> };
    await ownerMess(req.user.id, input.messId);
    for (const record of input.records) await assertCustomer(record.userId, input.messId, input.date);
    const saved = await db.transaction(async (tx) => {
      const records = [];
      for (const record of input.records) {
        const [savedRecord] = await tx.insert(attendance).values({ id: randomUUID(), ...record, messId: input.messId, date: input.date, method: "MANUAL", markedBy: req.user.id }).onConflictDoUpdate({
          target: [attendance.userId, attendance.messId, attendance.date, attendance.mealType],
          set: { status: record.status, method: "MANUAL", markedBy: req.user.id, updatedAt: new Date() }
        }).returning();
        records.push(savedRecord);
      }
      return records;
    });
    res.status(201).json({ success: true, data: { date: input.date, items: saved }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

attendanceRouter.post("/owner/attendance/qr", authenticate, requireRole("OWNER"), validate(QrAttendanceSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as { messId: string; date: string; mealType: "BREAKFAST" | "LUNCH" | "DINNER"; token: string };
    await ownerMess(req.user.id, input.messId);
    const [user] = await db.select({ id: users.id, name: users.name, status: users.status }).from(users).where(eq(users.qrToken, input.token)).limit(1);
    if (!user) { next(createApiError("QR token is invalid", 400, "INVALID_QR_TOKEN")); return; }
    if (user.status !== "ACTIVE") { next(createApiError("User account is disabled", 403, "USER_DISABLED")); return; }
    if (!await activeSubscription(user.id, input.messId, input.date)) { next(createApiError("Customer does not have an active subscription", 403, "ACTIVE_SUBSCRIPTION_REQUIRED")); return; }
    const record = await upsertAttendance({ userId: user.id, messId: input.messId, date: input.date, mealType: input.mealType, status: "PRESENT", method: "QR", markedBy: req.user.id });
    res.status(201).json({ success: true, data: { user, attendance: record }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

attendanceRouter.get("/attendance/me", authenticate, requireRole("USER"), validate(AttendanceQuerySchema, "query"), async (req: Request, res: Response, next) => {
  try {
    const query = req.query as { messId?: string; date?: string };
    const filters = [eq(attendance.userId, req.user.id)];
    if (query.messId) filters.push(eq(attendance.messId, query.messId));
    if (query.date) filters.push(eq(attendance.date, query.date));
    const records = await db.select().from(attendance).where(and(...filters)).orderBy(desc(attendance.date), desc(attendance.updatedAt));
    res.json({ success: true, data: { items: records }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
