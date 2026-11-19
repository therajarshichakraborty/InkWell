import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { buildRss } from "../../lib/rss.js";
import { followsRepository } from "../follows/follows.repository.js";
import { postsRepository } from "../posts/posts.repository.js";
import { postsService } from "../posts/posts.service.js";
import { seriesRepository } from "../series/series.repository.js";
import { usersRepository } from "./users.repository.js";

const RSS_LIMIT = 50;

export const usersService = {
  async resolve(username: string) {
    const author = await usersRepository.findByUsername(username);

    if (!author) throw HttpError.notFound("Author");

    return author;
  },

  async getBlog(username: string, viewerId: string | null) {
    const { id, ...author } = await usersService.resolve(username);

    const [series, followers, following, posts, viewerFollows] = await Promise.all([
      seriesRepository.listPublished(id),
      followsRepository.countFollowers(id),
      followsRepository.countFollowing(id),
      postsRepository.countPublished(id),
      viewerId ? followsRepository.exists(viewerId, id) : false,
    ]);

    return {
      author,
      series,
      stats: { followers, following, posts },
      viewer: { isSelf: viewerId === id, following: viewerFollows },
    };
  },

  async getPosts(username: string, seriesSlug?: string) {
    const author = await usersService.resolve(username);

    if (!seriesSlug) return postsRepository.findPublished({ authorId: author.id });

    const series = await seriesRepository.findBySlug(author.id, seriesSlug);

    if (!series) throw HttpError.notFound("Series");

    return postsRepository.findPublished({ seriesId: series.id });
  },

  async getPost(username: string, slug: string, viewerId: string | null) {
    const author = await usersService.resolve(username);
    return postsService.findPublished(author.id, slug, viewerId);
  },

  async getRss(username: string) {
    const author = await usersService.resolve(username);
    const posts = await postsRepository.findPublished({ authorId: author.id }, RSS_LIMIT);
    const blogUrl = `${env.APP_URL}/${author.username}`;

    return buildRss({
      title: author.name,
      url: blogUrl,
      description: author.bio,
      items: posts.map((item) => ({
        title: item.title,
        url: `${blogUrl}/${item.slug}`,
        description: item.excerpt,
        publishedAt: item.publishedAt,
      })),
    });
  },
};
