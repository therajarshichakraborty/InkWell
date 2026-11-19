import express, { Router } from "express";
import { UPLOADS_DIR } from "../../config/uploads.js";
import { requireAuth } from "../../middleware/auth.js";
import { singleImage } from "../../middleware/upload.js";
import { uploadsController } from "./uploads.controller.js";

export const uploadsRoutes = Router()
  .post("/", requireAuth, singleImage, uploadsController.create)
  .use(express.static(UPLOADS_DIR, { index: false, immutable: true, maxAge: "1y" }));
