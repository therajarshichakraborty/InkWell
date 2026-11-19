import { HttpError } from "../../lib/http-error.js";
import { postsRepository } from "../posts/posts.repository.js";
import { tagsRepository } from "./tags.repository.js";

const POPULAR_LIMIT = 24;

export const tagsService = {
  popular() {
    return tagsRepository.popular(POPULAR_LIMIT);
  },

  async getTag(slug: string) {
    const found = await tagsRepository.findBySlug(slug);

    if (!found) throw HttpError.notFound("Tag");

    const posts = await postsRepository.findPublished({ tagId: found.id });
    return { tag: { name: found.name, slug: found.slug }, posts };
  },
};
