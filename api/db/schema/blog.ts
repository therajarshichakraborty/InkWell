import { index, integer, pgEnum, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth.js";

const id = () =>
  text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const owner = () =>
  text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const series = pgTable(
  "series",
  {
    id: id(),
    userId: owner(),
    name: text().notNull(),
    slug: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [unique().on(table.userId, table.slug)],
);

export const post = pgTable(
  "post",
  {
    id: id(),
    userId: owner(),
    seriesId: text().references(() => series.id, { onDelete: "set null" }),
    title: text().notNull(),
    slug: text().notNull(),
    coverImage: text(),
    content: text().notNull(),
    html: text().notNull(),
    excerpt: text().notNull(),
    readingTime: integer().notNull(),
    status: postStatus().notNull().default("draft"),
    publishedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp()
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique().on(table.userId, table.slug),
    index().on(table.status, table.publishedAt),
    index().on(table.seriesId),
  ],
);

export const tag = pgTable("tag", {
  id: id(),
  name: text().notNull(),
  slug: text().notNull().unique(),
});

export const postTag = pgTable(
  "post_tag",
  {
    postId: text()
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    tagId: text()
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] }), index().on(table.tagId)],
);
