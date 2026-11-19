import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { engagementController } from "./engagement.controller.js";

export const engagementRoutes = Router()
  .put("/:id/like", requireAuth, engagementController.like)
  .delete("/:id/like", requireAuth, engagementController.unlike)
  .put("/:id/bookmark", requireAuth, engagementController.bookmark)
  .delete("/:id/bookmark", requireAuth, engagementController.unbookmark);

export const myBookmarksRoutes = Router().get("/", engagementController.bookmarks);
