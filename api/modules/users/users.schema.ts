import { z } from "zod";
import { usernameParamSchema } from "../../lib/validate.js";

export const blogPostsQuerySchema = z.object({ series: z.string().optional() });

export const blogPostParamsSchema = usernameParamSchema.extend({ slug: z.string().min(1) });
