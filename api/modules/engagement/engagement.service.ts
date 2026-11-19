import { postsRepository } from "../posts/posts.repository.js";
import { postsService } from "../posts/posts.service.js";
import { engagementRepository } from "./engagement.repository.js";

export const engagementService = {
  async setLiked(userId: string, postId: string, liked: boolean) {
    await postsService.assertPublished(postId);
    await (liked ? engagementRepository.like(userId, postId) : engagementRepository.unlike(userId, postId));
    return { liked, likeCount: await engagementRepository.countLikes(postId) };
  },

  async setBookmarked(userId: string, postId: string, bookmarked: boolean) {
    await postsService.assertPublished(postId);
    await (bookmarked ? engagementRepository.bookmark(userId, postId) : engagementRepository.unbookmark(userId, postId));
    return { bookmarked };
  },

  bookmarks(userId: string) {
    return postsRepository.findPublished({ bookmarkedBy: userId });
  },
};
