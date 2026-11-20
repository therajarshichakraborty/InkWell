import { get, put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "../../config/uploads.js";

// On Vercel the filesystem is read-only, so uploads go to Vercel Blob whenever a store is linked.
// Locally (no token) they are written to ./uploads and served by express.static.
export const useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const blobPath = (fileName: string) => `uploads/${fileName}`;

export const uploadsRepository = {
  async save(fileName: string, contents: Buffer, contentType: string) {
    if (useBlobStorage) {
      await put(blobPath(fileName), contents, { access: "public", contentType, addRandomSuffix: false });
      return;
    }

    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(path.join(UPLOADS_DIR, fileName), contents, { flag: "wx" });
  },

  async read(fileName: string) {
    const result = await get(blobPath(fileName), { access: "public" });
    return result?.statusCode === 200 ? result : null;
  },
};
