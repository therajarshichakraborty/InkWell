import type { Request, Response } from "express";
import { usernameParamSchema, validate } from "../../lib/validate.js";
import { followsService } from "./follows.service.js";

export const followsController = {
  async follow(req: Request, res: Response) {
    const { username } = validate(usernameParamSchema, req.params);
    res.json({ data: await followsService.follow(res.locals.userId, username) });
  },

  async unfollow(req: Request, res: Response) {
    const { username } = validate(usernameParamSchema, req.params);
    res.json({ data: await followsService.unfollow(res.locals.userId, username) });
  },

  async feed(_req: Request, res: Response) {
    res.json({ data: await followsService.feed(res.locals.userId) });
  },
};
