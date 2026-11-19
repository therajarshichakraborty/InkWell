import type { Request, Response } from "express";
import { idParamSchema, validate } from "../../lib/validate.js";
import { createCommentSchema } from "./comments.schema.js";
import { commentsService } from "./comments.service.js";

export const commentsController = {
  async list(req: Request, res: Response) {
    const { id } = validate(idParamSchema, req.params);
    res.json({ data: await commentsService.list(id) });
  },

  async create(req: Request, res: Response) {
    const { id } = validate(idParamSchema, req.params);
    const { content } = validate(createCommentSchema, req.body);
    res.status(201).json({ data: await commentsService.create(res.locals.userId, id, content) });
  },

  async remove(req: Request, res: Response) {
    const { id } = validate(idParamSchema, req.params);
    await commentsService.remove(res.locals.userId, id);
    res.status(204).end();
  },
};
