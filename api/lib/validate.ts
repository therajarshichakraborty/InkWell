import { z } from "zod";
import { UPLOAD_URL_PATTERN } from "../config/uploads.js";
import { HttpError } from "./http-error.js";

export function validate<T extends z.ZodType>(schema: T, input: unknown): z.infer<T> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw HttpError.badRequest(result.error.issues[0]?.message ?? "Invalid request");
  }

  return result.data;
}

export const idParamSchema = z.object({ id: z.string().min(1) });

export const usernameParamSchema = z.object({ username: z.string().min(1).max(30) });

export const uploadUrlSchema = z.string().regex(UPLOAD_URL_PATTERN, "Upload the image first");

export const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);
