import type { Request, Response } from "express";
import { usernameParamSchema, validate } from "../../lib/validate.js";
import { blogPostParamsSchema, blogPostsQuerySchema } from "./users.schema.js";
import { usersService } from "./users.service.js";

export const usersController = {
  async getBlog(req: Request, res: Response) {
    const { username } = validate(usernameParamSchema, req.params);
    res.json({ data: await usersService.getBlog(username, res.locals.viewerId) });
  },

  async getPosts(req: Request, res: Response) {
    const { username } = validate(usernameParamSchema, req.params);
    const { series } = validate(blogPostsQuerySchema, req.query);
    res.json({ data: await usersService.getPosts(username, series) });
  },

  async getPost(req: Request, res: Response) {
    const { username, slug } = validate(blogPostParamsSchema, req.params);
    res.json({ data: await usersService.getPost(username, slug, res.locals.viewerId) });
  },

  async getRss(req: Request, res: Response) {
    const { username } = validate(usernameParamSchema, req.params);
    res.type("application/rss+xml").send(await usersService.getRss(username));
  },
};
