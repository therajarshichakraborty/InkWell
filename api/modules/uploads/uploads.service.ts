import { UPLOADS_PATH } from "../../config/uploads.js";
import { HttpError } from "../../lib/http-error.js";
import { detectImageType, type ImageExtension } from "../../lib/image.js";
import { uploadsRepository } from "./uploads.repository.js";

export const CONTENT_TYPES: Record<ImageExtension, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

export const uploadsService = {
  async saveImage(file: Express.Multer.File | undefined) {
    if (!file) throw HttpError.badRequest("Attach an image");

    const extension = detectImageType(file.buffer);

    if (!extension) throw HttpError.badRequest("Only PNG, JPG, GIF and WebP images are supported");

    const fileName = `${crypto.randomUUID()}.${extension}`;
    await uploadsRepository.save(fileName, file.buffer, CONTENT_TYPES[extension]);

    return { url: `${UPLOADS_PATH}/${fileName}` };
  },
};
