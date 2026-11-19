import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { followsController } from "./follows.controller.js";

export const followsRoutes = Router()
  .put("/:username/follow", requireAuth, followsController.follow)
  .delete("/:username/follow", requireAuth, followsController.unfollow);

export const myFeedRoutes = Router().get("/", followsController.feed);
