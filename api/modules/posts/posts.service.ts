import { db } from "../../db/index.js";
import { HttpError } from "../../lib/http-error.js";
import { renderMarkdown } from "../../lib/markdown.js";
import { slugify, uniqueSlug } from "../../lib/slug.js";
import { seriesRepository } from "../series/series.repository.js";
import { tagsRepository } from "../tags/tags.repository.js";
import { postsRepository } from "./posts.repository.js";
import type { CreatePostInput, PostStatus, UpdatePostInput } from "./posts.schema.js";

const FEED_LIMIT = 30;

function normalizeTags(names: string[]) {
  const unique = new Map<string, string>();

  for (const name of names) {
    const slug = slugify(name);
    if (/[a-z0-9]/i.test(name) && !unique.has(slug)) unique.set(slug, name);
  }

  return [...unique].map(([slug, name]) => ({ slug, name }));
}

async function assertSeriesOwner(userId: string, seriesId: string | null | undefined) {
  if (seriesId && !(await seriesRepository.findOwned(userId, seriesId))) {
    throw HttpError.notFound("Series");
  }
}

async function availableSlug(userId: string, title: string, excludeId?: string) {
  const base = slugify(title);
  return uniqueSlug(base, await postsRepository.findSlugs(userId, base, excludeId));
}

export const postsService = {
  feed() {
    return postsRepository.findPublished({}, FEED_LIMIT);
  },

  async findPublished(authorId: string, slug: string, viewerId: string | null) {
    const found = await postsRepository.findPublishedBySlug(authorId, slug, viewerId);

    if (!found) throw HttpError.notFound("Post");

    return { ...found, tags: await tagsRepository.findByPost(found.id) };
  },

  async assertPublished(id: string) {
    const found = await postsRepository.findPublishedById(id);

    if (!found) throw HttpError.notFound("Post");

    return found;
  },

  listOwn(userId: string, status?: PostStatus) {
    return postsRepository.findByAuthor(userId, status);
  },

  async findOwn(userId: string, id: string) {
    const found = await postsRepository.findOwned(userId, id);

    if (!found) throw HttpError.notFound("Post");

    const tags = await tagsRepository.findByPost(id);
    return { ...found, tags: tags.map((item) => item.name) };
  },

  async create(userId: string, input: CreatePostInput) {
    await assertSeriesOwner(userId, input.seriesId);

    const status = input.status ?? "draft";
    const slug = await availableSlug(userId, input.title);

    return db.transaction(async (tx) => {
      const created = await postsRepository.insert(
        {
          userId,
          slug,
          status,
          title: input.title,
          content: input.content,
          coverImage: input.coverImage ?? null,
          seriesId: input.seriesId ?? null,
          publishedAt: status === "published" ? new Date() : null,
          ...renderMarkdown(input.content),
        },
        tx,
      );

      await tagsRepository.replaceForPost(created.id, normalizeTags(input.tags ?? []), tx);
      return created;
    });
  },

  async update(userId: string, id: string, input: UpdatePostInput) {
    const existing = await postsService.findOwn(userId, id);
    await assertSeriesOwner(userId, input.seriesId);

    const neverPublished = existing.publishedAt === null;
    const renamedTitle = input.title !== existing.title ? input.title : undefined;
    const slug = renamedTitle && neverPublished ? await availableSlug(userId, renamedTitle, id) : undefined;

    return db.transaction(async (tx) => {
      const updated = await postsRepository.update(
        userId,
        id,
        {
          slug,
          title: input.title,
          coverImage: input.coverImage,
          seriesId: input.seriesId,
          status: input.status,
          ...(input.content !== undefined && { content: input.content, ...renderMarkdown(input.content) }),
          ...(input.status === "published" && neverPublished && { publishedAt: new Date() }),
        },
        tx,
      );

      if (!updated) throw HttpError.notFound("Post");
      if (input.tags) await tagsRepository.replaceForPost(id, normalizeTags(input.tags), tx);

      return updated;
    });
  },

  async remove(userId: string, id: string) {
    if (!(await postsRepository.delete(userId, id))) throw HttpError.notFound("Post");
  },
};
