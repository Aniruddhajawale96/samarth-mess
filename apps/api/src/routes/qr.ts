import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db, users } from "@samarth-mess/db";
import { QrTokenSchema } from "@samarth-mess/validation";
import { authenticate } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";

export const qrRouter: ExpressRouter = Router();

qrRouter.get("/users/me/qr", authenticate, requireRole("USER", "OWNER", "ADMIN"), async (req: Request, res: Response, next) => {
  try {
    let [user] = await db.select({ id: users.id, name: users.name, status: users.status, qrToken: users.qrToken }).from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user || user.status !== "ACTIVE") { next(createApiError("Authentication required", 401, "UNAUTHORIZED")); return; }
    if (!user.qrToken) {
      const qrToken = randomBytes(32).toString("base64url");
      [user] = await db.update(users).set({ qrToken, updatedAt: new Date() }).where(eq(users.id, req.user.id)).returning({ id: users.id, name: users.name, status: users.status, qrToken: users.qrToken });
    }
    const qrDataUrl = await QRCode.toDataURL(user.qrToken!, { errorCorrectionLevel: "M", margin: 1, width: 320 });
    res.json({ success: true, data: { token: user.qrToken, qrDataUrl, user: { id: user.id, name: user.name } }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

qrRouter.post("/qr/resolve", authenticate, requireRole("OWNER"), validate(QrTokenSchema), async (req: Request, res: Response, next) => {
  try {
    const { token } = req.body as { token: string };
    const [user] = await db.select({ id: users.id, name: users.name, status: users.status }).from(users).where(eq(users.qrToken, token)).limit(1);
    if (!user) { next(createApiError("QR token is invalid", 400, "INVALID_QR_TOKEN")); return; }
    res.json({ success: true, data: { user }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});
