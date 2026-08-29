import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db, menuItems, menus, messes } from "@samarth-mess/db";
import { MenuCreateSchema, MenuDateQuerySchema, MenuParamsSchema, MenuUpdateSchema } from "@samarth-mess/validation";
import { createApiError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireMenuOwner, requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";

export const menuRouter: ExpressRouter = Router();

function dateRange(date: string): { startDate: Date; endDate: Date } {
  const startDate = new Date(`${date}T00:00:00.000Z`);
  return { startDate, endDate: new Date(startDate.getTime() + 24 * 60 * 60 * 1000) };
}

function itemValues(menuId: string, items: Array<{ mealType: "BREAKFAST" | "LUNCH" | "DINNER"; name: string; description?: string | null; image?: string | null; displayOrder: number }>) {
  return items.map((item) => ({ id: randomUUID(), menuId, mealType: item.mealType, itemName: item.name, description: item.description ?? null, image: item.image ?? null, displayOrder: item.displayOrder }));
}

async function ownerMess(req: Request) {
  const [mess] = await db.select({ id: messes.id }).from(messes).where(eq(messes.ownerId, req.user.id)).limit(1);
  return mess;
}

menuRouter.get("/owner/menus", authenticate, requireRole("OWNER"), async (req: Request, res: Response, next) => {
  try {
    const rows = await db.select({ menu: menus, messName: messes.name }).from(menus)
      .innerJoin(messes, eq(messes.id, menus.messId))
      .where(eq(messes.ownerId, req.user.id)).orderBy(asc(menus.startDate), asc(menus.createdAt));
    res.json({ success: true, data: { items: rows }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

menuRouter.post("/owner/menus", authenticate, requireRole("OWNER"), validate(MenuCreateSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as typeof MenuCreateSchema._type;
    const mess = await ownerMess(req);
    if (!mess || mess.id !== input.messId) { next(createApiError("You do not have access to this mess", 403, "FORBIDDEN")); return; }
    const range = dateRange(input.date);
    const result = await db.transaction(async (tx) => {
      const [menu] = await tx.insert(menus).values({ id: randomUUID(), messId: input.messId, status: input.status, startDate: range.startDate, endDate: range.endDate }).returning();
      const items = await tx.insert(menuItems).values(itemValues(menu.id, input.items)).returning();
      return { menu, items };
    });
    res.status(201).json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

menuRouter.patch("/owner/menus/:menuId", authenticate, requireRole("OWNER"), validate(MenuParamsSchema, "params"), requireMenuOwner, validate(MenuUpdateSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as typeof MenuUpdateSchema._type;
    const [current] = await db.select().from(menus).where(eq(menus.id, req.params.menuId)).limit(1);
    if (!current) { next(createApiError("Menu not found", 404, "NOT_FOUND")); return; }
    const range = input.date ? dateRange(input.date) : undefined;
    const [menu] = await db.update(menus).set({
      ...(input.status === undefined ? {} : { status: input.status }),
      ...(range ?? {}),
      updatedAt: new Date()
    }).where(eq(menus.id, current.id)).returning();
    let items;
    if (input.items) {
      await db.delete(menuItems).where(eq(menuItems.menuId, current.id));
      items = await db.insert(menuItems).values(itemValues(current.id, input.items)).returning();
    } else {
      items = await db.select().from(menuItems).where(eq(menuItems.menuId, current.id)).orderBy(asc(menuItems.displayOrder));
    }
    res.json({ success: true, data: { menu, items }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

menuRouter.post("/owner/menus/:menuId/publish", authenticate, requireRole("OWNER"), validate(MenuParamsSchema, "params"), requireMenuOwner, async (req: Request, res: Response, next) => {
  try {
    const [menu] = await db.update(menus).set({ status: "PUBLISHED", updatedAt: new Date() }).where(eq(menus.id, req.params.menuId)).returning();
    res.json({ success: true, data: { menu }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

menuRouter.delete("/owner/menus/:menuId", authenticate, requireRole("OWNER"), validate(MenuParamsSchema, "params"), requireMenuOwner, async (req: Request, res: Response, next) => {
  try {
    const [menu] = await db.update(menus).set({ status: "ARCHIVED", updatedAt: new Date() }).where(eq(menus.id, req.params.menuId)).returning();
    res.json({ success: true, data: { menu }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

menuRouter.get("/owner/menus/:menuId", authenticate, requireRole("OWNER"), validate(MenuParamsSchema, "params"), requireMenuOwner, async (req: Request, res: Response, next) => {
  try {
    const [menu] = await db.select().from(menus).where(eq(menus.id, req.params.menuId)).limit(1);
    const items = await db.select().from(menuItems).where(eq(menuItems.menuId, req.params.menuId)).orderBy(asc(menuItems.displayOrder));
    res.json({ success: true, data: { menu, items }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
