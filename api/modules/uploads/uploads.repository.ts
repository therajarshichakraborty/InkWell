import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { UPLOADS_DIR } from "../../config/uploads.js";

export const uploadsRepository = {
  async save(fileName: string, contents: Buffer) {
    await mkdir(UPLOADS_DIR, { recursive: true });
    await writeFile(path.join(UPLOADS_DIR, fileName), contents, { flag: "wx" });
  },
};
