import { and, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { db, type Executor } from "../../db/index.js";
import { post, postTag, tag } from "../../db/schema/index.js";

type TagInput = { name: string; slug: string };

const publishedPostTags = and(eq(postTag.postId, post.id), eq(post.status, "published"));

export const tagsRepository = {
  popular(limit: number) {
    return db
      .select({ name: tag.name, slug: tag.slug, postCount: count(post.id) })
      .from(tag)
      .innerJoin(postTag, eq(postTag.tagId, tag.id))
      .innerJoin(post, publishedPostTags)
      .groupBy(tag.id)
      .orderBy(desc(count(post.id)), tag.name)
      .limit(limit);
  },

  search(pattern: string, limit: number) {
    return db
      .select({ name: tag.name, slug: tag.slug, postCount: count(post.id) })
      .from(tag)
      .innerJoin(postTag, eq(postTag.tagId, tag.id))
      .innerJoin(post, publishedPostTags)
      .where(ilike(tag.name, pattern))
      .groupBy(tag.id)
      .orderBy(desc(count(post.id)))
      .limit(limit);
  },

  count() {
    return db.$count(tag);
  },

  async findBySlug(slug: string) {
    const [found] = await db.select({ id: tag.id, name: tag.name, slug: tag.slug }).from(tag).where(eq(tag.slug, slug)).limit(1);
    return found ?? null;
  },

  findByPost(postId: string) {
    return db
      .select({ name: tag.name, slug: tag.slug })
      .from(tag)
      .innerJoin(postTag, eq(postTag.tagId, tag.id))
      .where(eq(postTag.postId, postId))
      .orderBy(tag.name);
  },

  async replaceForPost(postId: string, tags: TagInput[], executor: Executor = db) {
    await executor.delete(postTag).where(eq(postTag.postId, postId));

    if (tags.length === 0) return;

    await executor.insert(tag).values(tags).onConflictDoNothing({ target: tag.slug });

    const saved = await executor
      .select({ id: tag.id })
      .from(tag)
      .where(
        inArray(
          tag.slug,
          tags.map((item) => item.slug),
        ),
      );

    await executor.insert(postTag).values(saved.map((item) => ({ postId, tagId: item.id })));
  },
};
