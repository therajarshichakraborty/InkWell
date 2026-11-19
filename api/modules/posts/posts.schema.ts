import { z } from "zod";
import { uploadUrlSchema } from "../../lib/validate.js";

const postStatus = z.enum(["draft", "published"]);

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  content: z.string().max(100_000, "Content is too long"),
  coverImage: uploadUrlSchema.nullable().optional(),
  seriesId: z.string().nullable().optional(),
  status: postStatus.optional(),
  tags: z.array(z.string().trim().min(1).max(30, "Tags are 30 characters max")).max(5, "Use up to 5 tags").optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  status: postStatus.optional(),
});

export type PostStatus = z.infer<typeof postStatus>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
