import type { Request, Response } from "express";
import { idParamSchema, validate } from "../../lib/validate.js";
import { engagementService } from "./engagement.service.js";

function toggle(action: "setLiked" | "setBookmarked", value: boolean) {
  return async (req: Request, res: Response) => {
    const { id } = validate(idParamSchema, req.params);
    res.json({ data: await engagementService[action](res.locals.userId, id, value) });
  };
}

export const engagementController = {
  like: toggle("setLiked", true),
  unlike: toggle("setLiked", false),
  bookmark: toggle("setBookmarked", true),
  unbookmark: toggle("setBookmarked", false),

  async bookmarks(_req: Request, res: Response) {
    res.json({ data: await engagementService.bookmarks(res.locals.userId) });
  },
};
