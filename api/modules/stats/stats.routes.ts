import { Router } from "express";
import { statsController } from "./stats.controller.js";

export const statsRoutes = Router().get("/", statsController.platform);
