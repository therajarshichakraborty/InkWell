import { and, asc, count, eq } from "drizzle-orm";
import { db, single } from "../../db/index.js";
import { post, series } from "../../db/schema/index.js";

export const seriesRepository = {
  listWithCounts(userId: string) {
    return db
      .select({ id: series.id, name: series.name, slug: series.slug, postCount: count(post.id) })
      .from(series)
      .leftJoin(post, eq(post.seriesId, series.id))
      .where(eq(series.userId, userId))
      .groupBy(series.id)
      .orderBy(asc(series.createdAt));
  },

  listPublished(userId: string) {
    return db
      .select({ name: series.name, slug: series.slug })
      .from(series)
      .innerJoin(post, and(eq(post.seriesId, series.id), eq(post.status, "published")))
      .where(eq(series.userId, userId))
      .groupBy(series.id)
      .orderBy(asc(series.createdAt));
  },

  async findOwned(userId: string, id: string) {
    const [found] = await db
      .select({ id: series.id })
      .from(series)
      .where(and(eq(series.id, id), eq(series.userId, userId)))
      .limit(1);

    return found ?? null;
  },

  async findBySlug(userId: string, slug: string) {
    const [found] = await db
      .select({ id: series.id })
      .from(series)
      .where(and(eq(series.userId, userId), eq(series.slug, slug)))
      .limit(1);

    return found ?? null;
  },

  insert(values: typeof series.$inferInsert) {
    return db
      .insert(series)
      .values(values)
      .returning({ id: series.id, name: series.name, slug: series.slug })
      .then(single);
  },

  async delete(userId: string, id: string) {
    const deleted = await db
      .delete(series)
      .where(and(eq(series.id, id), eq(series.userId, userId)))
      .returning({ id: series.id });

    return deleted.length > 0;
  },
};
