import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { tagParamSchema } from "./tags.schema.js";
import { tagsService } from "./tags.service.js";

export const tagsController = {
  async popular(_req: Request, res: Response) {
    res.json({ data: await tagsService.popular() });
  },

  async getTag(req: Request, res: Response) {
    const { slug } = validate(tagParamSchema, req.params);
    res.json({ data: await tagsService.getTag(slug) });
  },
};
