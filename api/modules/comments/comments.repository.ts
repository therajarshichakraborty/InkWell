import { asc, eq } from "drizzle-orm";
import { db, single } from "../../db/index.js";
import { comment, post, user } from "../../db/schema/index.js";

export const commentsRepository = {
  listByPost(postId: string) {
    return db
      .select({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: { name: user.name, username: user.username, image: user.image },
      })
      .from(comment)
      .innerJoin(user, eq(comment.userId, user.id))
      .where(eq(comment.postId, postId))
      .orderBy(asc(comment.createdAt));
  },

  async findWithPostAuthor(id: string) {
    const [found] = await db
      .select({ id: comment.id, userId: comment.userId, postAuthorId: post.userId })
      .from(comment)
      .innerJoin(post, eq(comment.postId, post.id))
      .where(eq(comment.id, id))
      .limit(1);

    return found ?? null;
  },

  insert(values: typeof comment.$inferInsert) {
    return db.insert(comment).values(values).returning({ id: comment.id }).then(single);
  },

  async delete(id: string) {
    await db.delete(comment).where(eq(comment.id, id));
  },
};
