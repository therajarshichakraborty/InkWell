import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { follow } from "../../db/schema/index.js";

const edge = (followerId: string, followingId: string) =>
  and(eq(follow.followerId, followerId), eq(follow.followingId, followingId));

export const followsRepository = {
  async insert(followerId: string, followingId: string) {
    await db.insert(follow).values({ followerId, followingId }).onConflictDoNothing();
  },

  async delete(followerId: string, followingId: string) {
    await db.delete(follow).where(edge(followerId, followingId));
  },

  async exists(followerId: string, followingId: string) {
    return (await db.$count(follow, edge(followerId, followingId))) > 0;
  },

  countFollowers(userId: string) {
    return db.$count(follow, eq(follow.followingId, userId));
  },

  countFollowing(userId: string) {
    return db.$count(follow, eq(follow.followerId, userId));
  },
};
