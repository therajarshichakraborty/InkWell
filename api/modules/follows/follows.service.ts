import { HttpError } from "../../lib/http-error.js";
import { postsRepository } from "../posts/posts.repository.js";
import { usersService } from "../users/users.service.js";
import { followsRepository } from "./follows.repository.js";

const FEED_LIMIT = 30;

async function followState(followerId: string, followingId: string) {
  const [following, followers] = await Promise.all([
    followsRepository.exists(followerId, followingId),
    followsRepository.countFollowers(followingId),
  ]);

  return { following, followers };
}

export const followsService = {
  async follow(userId: string, username: string) {
    const author = await usersService.resolve(username);

    if (author.id === userId) throw HttpError.badRequest("You cannot follow yourself");

    await followsRepository.insert(userId, author.id);
    return followState(userId, author.id);
  },

  async unfollow(userId: string, username: string) {
    const author = await usersService.resolve(username);
    await followsRepository.delete(userId, author.id);
    return followState(userId, author.id);
  },

  feed(userId: string) {
    return postsRepository.findPublished({ followedBy: userId }, FEED_LIMIT);
  },
};
