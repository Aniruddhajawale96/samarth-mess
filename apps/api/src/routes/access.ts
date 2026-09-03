import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { requireMessOwner, requireRole } from "../middleware/authorize.js";

export const accessRouter: ExpressRouter = Router();

accessRouter.get("/user/access-check", authenticate, requireRole("USER"), (_req, res) => {
  res.json({ success: true, data: { role: "USER" }, timestamp: new Date().toISOString() });
});

accessRouter.get("/owner/access-check", authenticate, requireRole("OWNER"), (_req, res) => {
  res.json({ success: true, data: { role: "OWNER" }, timestamp: new Date().toISOString() });
});

accessRouter.get("/admin/access-check", authenticate, requireRole("ADMIN"), (_req, res) => {
  res.json({ success: true, data: { role: "ADMIN" }, timestamp: new Date().toISOString() });
});

accessRouter.get("/owner/messes/:messId/access-check", authenticate, requireMessOwner, (req, res) => {
  res.json({ success: true, data: { messId: req.params.messId, ownerId: req.user.id }, timestamp: new Date().toISOString() });
});
