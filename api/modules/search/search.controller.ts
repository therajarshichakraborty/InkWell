import type { Request, Response } from "express";
import { validate } from "../../lib/validate.js";
import { searchQuerySchema } from "./search.schema.js";
import { searchService } from "./search.service.js";

export const searchController = {
  async search(req: Request, res: Response) {
    const { q } = validate(searchQuerySchema, req.query);
    res.json({ data: await searchService.search(q) });
  },
};
