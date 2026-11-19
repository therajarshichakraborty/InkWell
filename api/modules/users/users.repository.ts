import { asc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { user } from "../../db/schema/index.js";

const profileFields = {
  name: user.name,
  username: user.username,
  bio: user.bio,
  image: user.image,
};

export const usersRepository = {
  async findByUsername(username: string) {
    const [found] = await db
      .select({ id: user.id, ...profileFields, joinedAt: user.createdAt })
      .from(user)
      .where(eq(user.username, username.toLowerCase()))
      .limit(1);

    return found ?? null;
  },

  search(pattern: string, limit: number) {
    return db
      .select(profileFields)
      .from(user)
      .where(or(ilike(user.username, pattern), ilike(user.name, pattern)))
      .orderBy(asc(user.username))
      .limit(limit);
  },

  count() {
    return db.$count(user);
  },
};
