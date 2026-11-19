import { db } from "../../db/index.js";
import { postLike } from "../../db/schema/index.js";

export const statsRepository = {
  countLikes() {
    return db.$count(postLike);
  },
};
