import { Router, type Request, type Response, type Router as ExpressRouter } from "express";
import { randomUUID } from "node:crypto";
import { db, users } from "@samarth-mess/db";
import { eq } from "drizzle-orm";
import { RegisterUserSchema, LoginUserSchema, ProfileUpdateSchema, VerifyPhoneSchema } from "@samarth-mess/validation";
import { createApiError } from "../middleware/errorHandler.js";
import { validate } from "../middleware/validate.js";
import { authenticate } from "../middleware/authenticate.js";
import { clearAuthCookie, getAccessToken, hashPassword, revokeToken, setAuthCookie, signToken, verifyPassword } from "../lib/auth.js";

export const authRouter: ExpressRouter = Router();

function publicUser(user: typeof users.$inferSelect) {
  return { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, userType: user.userType, profilePhotoUrl: user.profilePhotoUrl, status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

authRouter.post("/auth/register", validate(RegisterUserSchema), async (req: Request, res: Response, next) => {
  const input = req.body as { name: string; phone: string; email?: string; password: string; role: "USER" | "OWNER"; userType: "STUDENT" | "PROFESSIONAL" };
  try {
    const passwordHash = await hashPassword(input.password);
    const [user] = await db.insert(users).values({ id: randomUUID(), name: input.name, phone: input.phone, email: input.email || null, passwordHash, role: input.role, userType: input.userType }).returning();
    const token = signToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);
    res.status(201).json({ success: true, data: { user: publicUser(user), token }, timestamp: new Date().toISOString() });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      next(createApiError("An account with this phone already exists", 409, "DUPLICATE_IDENTITY"));
      return;
    }
    next(error);
  }
});

authRouter.post("/auth/login", validate(LoginUserSchema), async (req: Request, res: Response, next) => {
  const input = req.body as { phone: string; password: string };
  try {
    const [user] = await db.select().from(users).where(eq(users.phone, input.phone)).limit(1);
    const valid = user ? await verifyPassword(input.password, user.passwordHash) : false;
    if (!user || !valid || user.status !== "ACTIVE") {
      next(createApiError("Invalid phone or password", 401, "INVALID_CREDENTIALS"));
      return;
    }
    const token = signToken({ sub: user.id, role: user.role });
    setAuthCookie(res, token);
    res.json({ success: true, data: { user: publicUser(user), token }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

authRouter.get("/auth/me", authenticate, async (req: Request, res: Response, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user || user.status !== "ACTIVE") { next(createApiError("Authentication required", 401, "UNAUTHORIZED")); return; }
    res.json({ success: true, data: { user: publicUser(user) }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

authRouter.get("/users/me", authenticate, async (req: Request, res: Response, next) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user) { next(createApiError("User not found", 404, "NOT_FOUND")); return; }
    res.json({ success: true, data: { user: publicUser(user) }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

authRouter.patch("/users/me", authenticate, validate(ProfileUpdateSchema), async (req: Request, res: Response, next) => {
  try {
    const input = req.body as { name?: string; email?: string; userType?: "STUDENT" | "PROFESSIONAL" };
    const [user] = await db.update(users).set({ ...input, email: input.email === "" ? null : input.email, updatedAt: new Date() }).where(eq(users.id, req.user.id)).returning();
    res.json({ success: true, data: { user: publicUser(user) }, timestamp: new Date().toISOString() });
  } catch (error) { next(error); }
});

authRouter.post("/auth/verify-phone", authenticate, validate(VerifyPhoneSchema), async (_req, res) => {
  res.status(501).json({ success: false, error: { code: "OTP_PROVIDER_NOT_CONFIGURED", message: "Phone verification provider is not configured" }, timestamp: new Date().toISOString() });
});

authRouter.post("/auth/logout", (req, res) => {
  const token = getAccessToken({ headers: req.headers, headersCookie: req.headers.cookie });
  if (token) revokeToken(token);
  clearAuthCookie(res);
  res.json({ success: true, data: { loggedOut: true }, timestamp: new Date().toISOString() });
});
