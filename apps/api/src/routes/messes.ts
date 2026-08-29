import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import { and, asc, eq, ilike } from "drizzle-orm";
import { db, menuItems, menus, messes, users } from "@samarth-mess/db";
import { MessCreateSchema, MessStatusUpdateSchema, MessUpdateSchema, PaginationSchema } from "@samarth-mess/validation";
import { createApiError } from "../middleware/errorHandler.js";
import { authenticate } from "../middleware/authenticate.js";
import { requireMessOwner, requireRole } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { singleImage } from "../middleware/upload.js";

export const messRouter: ExpressRouter = Router();

function publicMess(mess: typeof messes.$inferSelect) {
  return {
    id: mess.id,
    name: mess.name,
    description: mess.description,
    coverImage: mess.coverImage,
    rating: null,
    distance: null,
    address: mess.address,
    contact: mess.contact,
    monthlyPrice: mess.monthlyPrice,
    mealsPerDay: mess.mealsPerDay,
    status: mess.status,
    createdAt: mess.createdAt,
    updatedAt: mess.updatedAt
  };
}

async function publishedMenuPreview(messId: string) {
  const rows = await db.select({
    menuId: menus.id,
    mealType: menuItems.mealType,
    itemName: menuItems.itemName,
    description: menuItems.description,
    displayOrder: menuItems.displayOrder
  }).from(menus)
    .leftJoin(menuItems, eq(menuItems.menuId, menus.id))
    .where(and(eq(menus.messId, messId), eq(menus.status, "PUBLISHED")))
    .orderBy(asc(menuItems.displayOrder));

  return rows.map(({ menuId, displayOrder, ...item }) => ({ menuId, ...item, displayOrder }));
}

messRouter.get("/messes", validate(PaginationSchema, "query"), async (req: Request, res: Response, next) => {
  try {
    const query = req.query as unknown as { page: number; limit: number; search?: string };
    const filters = [eq(messes.status, "ACTIVE")];
    if (query.search) filters.push(ilike(messes.name, `%${query.search}%`));
    const rows = await db.select().from(messes).where(and(...filters)).limit(query.limit).offset((query.page - 1) * query.limit);
    res.json({ success: true, data: { items: rows.map(publicMess), page: query.page, limit: query.limit }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.get("/messes/:messId", async (req: Request, res: Response, next) => {
  try {
    const [mess] = await db.select().from(messes).where(and(eq(messes.id, req.params.messId), eq(messes.status, "ACTIVE"))).limit(1);
    if (!mess) { next(createApiError("Mess not found", 404, "NOT_FOUND")); return; }
    res.json({ success: true, data: { mess: publicMess(mess), menuPreview: await publishedMenuPreview(mess.id) }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.get("/messes/:messId/menu", async (req: Request, res: Response, next) => {
  try {
    const [mess] = await db.select({ id: messes.id }).from(messes).where(and(eq(messes.id, req.params.messId), eq(messes.status, "ACTIVE"))).limit(1);
    if (!mess) { next(createApiError("Mess not found", 404, "NOT_FOUND")); return; }
    res.json({ success: true, data: { items: await publishedMenuPreview(mess.id) }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.get("/owner/mess", authenticate, requireRole("OWNER"), async (req: Request, res: Response, next) => {
  try {
    const [mess] = await db.select().from(messes).where(eq(messes.ownerId, req.user.id)).limit(1);
    if (!mess) { next(createApiError("Mess not found", 404, "NOT_FOUND")); return; }
    res.json({ success: true, data: { mess }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.post("/owner/messes", authenticate, requireRole("OWNER"), validate(MessCreateSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as typeof MessCreateSchema._type;
    const existing = await db.select({ id: messes.id }).from(messes).where(eq(messes.ownerId, req.user.id)).limit(1);
    if (existing.length > 0) { next(createApiError("Owner already has a mess", 409, "MESS_ALREADY_EXISTS")); return; }
    const [mess] = await db.insert(messes).values({ id: randomUUID(), ownerId: req.user.id, ...input }).returning();
    res.status(201).json({ success: true, data: { mess }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.patch("/owner/messes/:messId", authenticate, requireRole("OWNER"), requireMessOwner, validate(MessUpdateSchema), async (req: Request, res: Response, next) => {
  try {
    const [mess] = await db.update(messes).set({ ...(req.body as Record<string, unknown>), updatedAt: new Date() }).where(eq(messes.id, req.params.messId)).returning();
    res.json({ success: true, data: { mess }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.patch("/owner/messes/:messId/status", authenticate, requireRole("OWNER"), requireMessOwner, validate(MessStatusUpdateSchema), async (req: Request, res: Response, next) => {
  try {
    const [mess] = await db.update(messes).set({ status: (req.body as { status: "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL" }).status, updatedAt: new Date() }).where(eq(messes.id, req.params.messId)).returning();
    res.json({ success: true, data: { mess }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.post("/owner/messes/:messId/cover-image", authenticate, requireRole("OWNER"), requireMessOwner, singleImage("cover"), async (req: Request, res: Response, next) => {
  try {
    const coverImage = `/uploads/${req.file!.filename}`;
    const [mess] = await db.update(messes).set({ coverImage, updatedAt: new Date() }).where(eq(messes.id, req.params.messId)).returning();
    res.json({ success: true, data: { mess }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

messRouter.post("/users/me/profile-photo", authenticate, singleImage("photo"), async (req: Request, res: Response, next) => {
  try {
    const profilePhotoUrl = `/uploads/${req.file!.filename}`;
    const [user] = await db.update(users).set({ profilePhotoUrl, updatedAt: new Date() }).where(eq(users.id, req.user.id)).returning();
    res.json({ success: true, data: { profilePhotoUrl, user: { id: user.id, profilePhotoUrl: user.profilePhotoUrl } }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
