import { Router } from "express";
import { optionalAuth } from "../../middleware/auth.js";
import { usersController } from "./users.controller.js";

export const usersRoutes = Router()
  .get("/:username", optionalAuth, usersController.getBlog)
  .get("/:username/posts", usersController.getPosts)
  .get("/:username/posts/:slug", optionalAuth, usersController.getPost)
  .get("/:username/rss", usersController.getRss);
