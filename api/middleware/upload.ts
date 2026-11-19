import multer from "multer";
import { MAX_UPLOAD_BYTES } from "../config/uploads.js";

export const singleImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
}).single("image");
