import { Router } from "express";
import { tagsController } from "./tags.controller.js";

export const tagsRoutes = Router().get("/", tagsController.popular).get("/:slug", tagsController.getTag);
