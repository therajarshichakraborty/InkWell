import { postsRepository } from "../posts/posts.repository.js";
import { tagsRepository } from "../tags/tags.repository.js";
import { usersRepository } from "../users/users.repository.js";
import { statsRepository } from "./stats.repository.js";

export const statsService = {
  async platform() {
    const [writers, posts, tags, likes] = await Promise.all([
      usersRepository.count(),
      postsRepository.countPublished(),
      tagsRepository.count(),
      statsRepository.countLikes(),
    ]);

    return { writers, posts, tags, likes };
  },
};
