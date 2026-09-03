import { mkdirSync } from "node:fs";
import { readFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
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
    callback(null, `${randomUUID()}${extension}`);
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
      void readFile(req.file.path).then((buffer) => {
        const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
        const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const webp = buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
        if (!jpeg && !png && !webp) return unlink(req.file!.path).catch(() => undefined).then(() => { throw createApiError("Uploaded file content is not a supported image", 400, "INVALID_UPLOAD"); });
        next();
      }).catch(next);
    });
  };
}
