import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Write something first").max(2000, "Comments are 2000 characters max"),
});
