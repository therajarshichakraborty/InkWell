import type { Request, Response } from "express";
import { idParamSchema, validate } from "../../lib/validate.js";
import { createPostSchema, listPostsQuerySchema, updatePostSchema } from "./posts.schema.js";
import { postsService } from "./posts.service.js";

export const postsController = {
  async feed(_req: Request, res: Response) {
    res.json({ data: await postsService.feed() });
  },

  async listOwn(req: Request, res: Response) {
    const { status } = validate(listPostsQuerySchema, req.query);
    res.json({ data: await postsService.listOwn(res.locals.userId, status) });
  },

  async findOwn(req: Request, res: Response) {
    const { id } = validate(idParamSchema, req.params);
    res.json({ data: await postsService.findOwn(res.locals.userId, id) });
  },

  async create(req: Request, res: Response) {
    const input = validate(createPostSchema, req.body);
    res.status(201).json({ data: await postsService.create(res.locals.userId, input) });
  },

  async update(req: Request, res: Response) {
    const { id } = validate(idParamSchema, req.params);
    const input = validate(updatePostSchema, req.body);
    res.json({ data: await postsService.update(res.locals.userId, id, input) });
  },

  async remove(req: Request, res: Response) {
    const { id } = validate(idParamSchema, req.params);
    await postsService.remove(res.locals.userId, id);
    res.status(204).end();
  },
};
