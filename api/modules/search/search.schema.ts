import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Type something to search").max(100, "Search is too long"),
});
