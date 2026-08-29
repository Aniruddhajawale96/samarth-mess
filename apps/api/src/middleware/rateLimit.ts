import type { NextFunction, Request, Response } from "express";
import { createApiError } from "./errorHandler.js";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(options: { windowMs: number; max: number; name: string }) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${options.name}:${req.ip}`;
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + options.windowMs } : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    if (bucket.count > options.max) {
      next(createApiError("Too many requests, please try again later", 429, "RATE_LIMITED"));
      return;
    }
    next();
  };
}
