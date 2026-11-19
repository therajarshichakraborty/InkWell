import { z } from "zod";

export const tagParamSchema = z.object({ slug: z.string().min(1).max(80) });
