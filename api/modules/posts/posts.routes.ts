import { Router } from "express";
import { postsController } from "./posts.controller.js";

export const postsRoutes = Router().get("/", postsController.feed);

export const myPostsRoutes = Router()
  .get("/", postsController.listOwn)
  .post("/", postsController.create)
  .get("/:id", postsController.findOwn)
  .patch("/:id", postsController.update)
  .delete("/:id", postsController.remove);
