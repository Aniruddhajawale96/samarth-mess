import { mkdirSync } from "node:fs";
import path from "node:path";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { createApiError } from "./errorHandler.js";

const uploadDirectory = path.resolve("uploads");
mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
  }
});

const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.mimetype)) {
      callback(new Error("Only JPEG, PNG, and WebP images are allowed"));
      return;
    }
    callback(null, true);
  }
});

export function singleImage(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    imageUpload.single(fieldName)(req, res, (error: unknown) => {
      if (error) {
        next(createApiError(error instanceof Error ? error.message : "Invalid image upload", 400, "INVALID_UPLOAD"));
        return;
      }
      if (!req.file) {
        next(createApiError("An image file is required", 400, "INVALID_UPLOAD"));
        return;
      }
      next();
    });
  };
}
