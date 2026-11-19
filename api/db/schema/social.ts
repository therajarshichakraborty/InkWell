import { sql } from "drizzle-orm";
import { check, index, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { post } from "./blog.js";

const userRef = () =>
  text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" });

const postRef = () =>
  text()
    .notNull()
    .references(() => post.id, { onDelete: "cascade" });

export const follow = pgTable(
  "follow",
  {
    followerId: userRef(),
    followingId: userRef(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
    index().on(table.followingId),
    check("follow_not_self", sql`${table.followerId} <> ${table.followingId}`),
  ],
);

export const postLike = pgTable(
  "post_like",
  {
    userId: userRef(),
    postId: postRef(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] }), index().on(table.postId)],
);

export const bookmark = pgTable(
  "bookmark",
  {
    userId: userRef(),
    postId: postRef(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.postId] })],
);

export const comment = pgTable(
  "comment",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: postRef(),
    userId: userRef(),
    content: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (table) => [index().on(table.postId, table.createdAt)],
);
