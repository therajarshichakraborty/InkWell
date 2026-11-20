import path from "node:path";

export const UPLOADS_DIR = path.resolve("uploads");
export const UPLOADS_PATH = "/api/uploads";
// Vercel rejects function request bodies over 4.5 MB, so stay under that.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const UPLOAD_URL_PATTERN = /^\/api\/uploads\/[a-f0-9-]{36}\.(png|jpg|gif|webp)$/;
