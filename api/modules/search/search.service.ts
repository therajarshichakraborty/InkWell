import { escapeLike } from "../../lib/validate.js";
import { postsRepository } from "../posts/posts.repository.js";
import { tagsRepository } from "../tags/tags.repository.js";
import { usersRepository } from "../users/users.repository.js";

const USERS_LIMIT = 12;
const POSTS_LIMIT = 20;
const TAGS_LIMIT = 12;

export const searchService = {
  async search(query: string) {
    const pattern = `%${escapeLike(query.replace(/^@/, ""))}%`;

    const [users, posts, tags] = await Promise.all([
      usersRepository.search(pattern, USERS_LIMIT),
      postsRepository.findPublished({ titlePattern: pattern }, POSTS_LIMIT),
      tagsRepository.search(pattern, TAGS_LIMIT),
    ]);

    return { users, posts, tags };
  },
};
