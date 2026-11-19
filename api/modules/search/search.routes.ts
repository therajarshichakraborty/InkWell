import { Router } from "express";
import { searchController } from "./search.controller.js";

export const searchRoutes = Router().get("/", searchController.search);
