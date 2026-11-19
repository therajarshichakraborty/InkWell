import { and, desc, eq, ilike, inArray, like, ne, or, sql } from "drizzle-orm";
import { db, single, type Executor } from "../../db/index.js";
import { bookmark, comment, follow, post, postLike, postTag, series, user } from "../../db/schema/index.js";
import type { PostStatus } from "./posts.schema.js";

const DEFAULT_LIMIT = 100;

type NewPost = typeof post.$inferInsert;

export type PublishedCriteria = {
  authorId?: string;
  seriesId?: string;
  tagId?: string;
  followedBy?: string;
  bookmarkedBy?: string;
  titlePattern?: string;
};
type PostChanges = Partial<Omit<NewPost, "id" | "userId">>;

const isPublished = eq(post.status, "published");

const summaryFields = {
  id: post.id,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  coverImage: post.coverImage,
  readingTime: post.readingTime,
  publishedAt: post.publishedAt,
  author: { name: user.name, username: user.username, image: user.image },
  series: { name: series.name, slug: series.slug },
  likeCount: sql<number>`(select count(*)::int from ${postLike} where ${postLike.postId} = ${post.id})`,
  commentCount: sql<number>`(select count(*)::int from ${comment} where ${comment.postId} = ${post.id})`,
};

function viewerHas(table: typeof postLike | typeof bookmark, viewerId: string | null) {
  if (!viewerId) return sql<boolean>`false`;
  return sql<boolean>`exists(select 1 from ${table} where ${table.postId} = ${post.id} and ${table.userId} = ${viewerId})`;
}

function publishedFilter(criteria: PublishedCriteria) {
  return and(
    isPublished,
    criteria.authorId ? eq(post.userId, criteria.authorId) : undefined,
    criteria.seriesId ? eq(post.seriesId, criteria.seriesId) : undefined,
    criteria.titlePattern ? ilike(post.title, criteria.titlePattern) : undefined,
    criteria.tagId
      ? inArray(post.id, db.select({ id: postTag.postId }).from(postTag).where(eq(postTag.tagId, criteria.tagId)))
      : undefined,
    criteria.followedBy
      ? inArray(
          post.userId,
          db.select({ id: follow.followingId }).from(follow).where(eq(follow.followerId, criteria.followedBy)),
        )
      : undefined,
    criteria.bookmarkedBy
      ? inArray(post.id, db.select({ id: bookmark.postId }).from(bookmark).where(eq(bookmark.userId, criteria.bookmarkedBy)))
      : undefined,
  );
}

export const postsRepository = {
  findPublished(criteria: PublishedCriteria = {}, limit = DEFAULT_LIMIT) {
    return db
      .select(summaryFields)
      .from(post)
      .innerJoin(user, eq(post.userId, user.id))
      .leftJoin(series, eq(post.seriesId, series.id))
      .where(publishedFilter(criteria))
      .orderBy(desc(post.publishedAt))
      .limit(limit);
  },

  async findPublishedBySlug(userId: string, slug: string, viewerId: string | null) {
    const [found] = await db
      .select({
        ...summaryFields,
        html: post.html,
        updatedAt: post.updatedAt,
        liked: viewerHas(postLike, viewerId),
        bookmarked: viewerHas(bookmark, viewerId),
      })
      .from(post)
      .innerJoin(user, eq(post.userId, user.id))
      .leftJoin(series, eq(post.seriesId, series.id))
      .where(and(isPublished, eq(post.userId, userId), eq(post.slug, slug)))
      .limit(1);

    return found ?? null;
  },

  countPublished(authorId?: string) {
    return db.$count(post, publishedFilter({ authorId }));
  },

  async findPublishedById(id: string) {
    const [found] = await db
      .select({ id: post.id, userId: post.userId })
      .from(post)
      .where(and(isPublished, eq(post.id, id)))
      .limit(1);

    return found ?? null;
  },

  findByAuthor(userId: string, status?: PostStatus) {
    return db
      .select({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        status: post.status,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        series: { name: series.name, slug: series.slug },
      })
      .from(post)
      .leftJoin(series, eq(post.seriesId, series.id))
      .where(and(eq(post.userId, userId), status ? eq(post.status, status) : undefined))
      .orderBy(desc(post.updatedAt));
  },

  async findOwned(userId: string, id: string) {
    const [found] = await db
      .select({
        id: post.id,
        slug: post.slug,
        title: post.title,
        content: post.content,
        coverImage: post.coverImage,
        seriesId: post.seriesId,
        status: post.status,
        publishedAt: post.publishedAt,
      })
      .from(post)
      .where(and(eq(post.id, id), eq(post.userId, userId)))
      .limit(1);

    return found ?? null;
  },

  async findSlugs(userId: string, base: string, excludeId?: string) {
    const rows = await db
      .select({ slug: post.slug })
      .from(post)
      .where(
        and(
          eq(post.userId, userId),
          or(eq(post.slug, base), like(post.slug, `${base}-%`)),
          excludeId ? ne(post.id, excludeId) : undefined,
        ),
      );

    return rows.map((row) => row.slug);
  },

  insert(values: NewPost, executor: Executor = db) {
    return executor.insert(post).values(values).returning({ id: post.id, slug: post.slug }).then(single);
  },

  async update(userId: string, id: string, changes: PostChanges, executor: Executor = db) {
    const [updated] = await executor
      .update(post)
      .set(changes)
      .where(and(eq(post.id, id), eq(post.userId, userId)))
      .returning({ id: post.id, slug: post.slug });

    return updated ?? null;
  },

  async delete(userId: string, id: string) {
    const deleted = await db
      .delete(post)
      .where(and(eq(post.id, id), eq(post.userId, userId)))
      .returning({ id: post.id });

    return deleted.length > 0;
  },
};
