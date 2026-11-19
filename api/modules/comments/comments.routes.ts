import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { commentsController } from "./comments.controller.js";

export const postCommentsRoutes = Router()
  .get("/:id/comments", commentsController.list)
  .post("/:id/comments", requireAuth, commentsController.create);

export const commentsRoutes = Router().delete("/:id", requireAuth, commentsController.remove);
