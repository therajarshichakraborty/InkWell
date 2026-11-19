import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { bookmark, postLike } from "../../db/schema/index.js";

export const engagementRepository = {
  async like(userId: string, postId: string) {
    await db.insert(postLike).values({ userId, postId }).onConflictDoNothing();
  },

  async unlike(userId: string, postId: string) {
    await db.delete(postLike).where(and(eq(postLike.userId, userId), eq(postLike.postId, postId)));
  },

  countLikes(postId: string) {
    return db.$count(postLike, eq(postLike.postId, postId));
  },

  async bookmark(userId: string, postId: string) {
    await db.insert(bookmark).values({ userId, postId }).onConflictDoNothing();
  },

  async unbookmark(userId: string, postId: string) {
    await db.delete(bookmark).where(and(eq(bookmark.userId, userId), eq(bookmark.postId, postId)));
  },
};
