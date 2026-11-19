import { z } from "zod";

export const createSeriesSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60, "Name is too long"),
});

export type CreateSeriesInput = z.infer<typeof createSeriesSchema>;
