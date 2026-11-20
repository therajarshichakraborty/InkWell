import express, { Router, type Request, type Response } from "express";
import { Readable } from "node:stream";
import type { ReadableStream } from "node:stream/web";
import { UPLOADS_DIR } from "../../config/uploads.js";
import { HttpError } from "../../lib/http-error.js";
import { requireAuth } from "../../middleware/auth.js";
import { singleImage } from "../../middleware/upload.js";
import { uploadsController } from "./uploads.controller.js";
import { uploadsRepository, useBlobStorage } from "./uploads.repository.js";

const FILE_NAME = /^[a-f0-9-]{36}\.(png|jpg|gif|webp)$/;

// Uploaded files never change (random names), so browsers and Vercel's CDN can cache them forever.
const IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";

async function serveFromBlob(req: Request<{ file: string }>, res: Response) {
  const { file } = req.params;
  const result = FILE_NAME.test(file) ? await uploadsRepository.read(file) : null;

  if (!result) throw HttpError.notFound("Image");

  res.set({
    "Content-Type": result.blob.contentType,
    "Content-Length": String(result.blob.size),
    "Cache-Control": IMMUTABLE,
    "X-Content-Type-Options": "nosniff",
  });
  Readable.fromWeb(result.stream as ReadableStream<Uint8Array>).pipe(res);
}

const uploadsRoutes = Router().post("/", requireAuth, singleImage, uploadsController.create);

if (useBlobStorage) {
  uploadsRoutes.get("/:file", serveFromBlob);
} else {
  uploadsRoutes.use(express.static(UPLOADS_DIR, { index: false, immutable: true, maxAge: "1y" }));
}

export { uploadsRoutes };
