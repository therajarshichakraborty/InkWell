import { HttpError } from "../../lib/http-error.js";
import { slugify } from "../../lib/slug.js";
import type { CreateSeriesInput } from "./series.schema.js";
import { seriesRepository } from "./series.repository.js";

export const seriesService = {
  listOwn(userId: string) {
    return seriesRepository.listWithCounts(userId);
  },

  async create(userId: string, input: CreateSeriesInput) {
    const slug = slugify(input.name);

    if (await seriesRepository.findBySlug(userId, slug)) {
      throw HttpError.conflict("You already have a series with that name");
    }

    return seriesRepository.insert({ userId, name: input.name, slug });
  },

  async remove(userId: string, id: string) {
    if (!(await seriesRepository.delete(userId, id))) throw HttpError.notFound("Series");
  },
};
