import { HttpError } from "../../lib/http-error.js";
import { postsService } from "../posts/posts.service.js";
import { commentsRepository } from "./comments.repository.js";

export const commentsService = {
  async list(postId: string) {
    await postsService.assertPublished(postId);
    return commentsRepository.listByPost(postId);
  },

  async create(userId: string, postId: string, content: string) {
    await postsService.assertPublished(postId);
    return commentsRepository.insert({ userId, postId, content });
  },

  async remove(userId: string, id: string) {
    const found = await commentsRepository.findWithPostAuthor(id);

    if (!found) throw HttpError.notFound("Comment");
    if (found.userId !== userId && found.postAuthorId !== userId) throw HttpError.forbidden();

    await commentsRepository.delete(id);
  },
};
