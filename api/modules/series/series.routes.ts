import { Router } from "express";
import { seriesController } from "./series.controller.js";

export const mySeriesRoutes = Router()
  .get("/", seriesController.listOwn)
  .post("/", seriesController.create)
  .delete("/:id", seriesController.remove);
