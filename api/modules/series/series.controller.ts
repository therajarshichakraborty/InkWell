import type { Request, Response } from "express";
import { idParamSchema, validate } from "../../lib/validate.js";
import { createSeriesSchema } from "./series.schema.js";
import { seriesService } from "./series.service.js";

export const seriesController = {
  async listOwn(_req: Request, res: Response) {
    res.json({ data: await seriesService.listOwn(res.locals.userId) });
  },

  async create(req: Request, res: Response) {
    const input = validate(createSeriesSchema, req.body);
    res.status(201).json({ data: await seriesService.create(res.locals.userId, input) });
  },

  async remove(req: Request, res: Response) {
    const { id } = validate(idParamSchema, req.params);
    await seriesService.remove(res.locals.userId, id);
    res.status(204).end();
  },
};
