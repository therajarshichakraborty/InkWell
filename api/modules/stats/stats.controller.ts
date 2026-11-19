import type { Request, Response } from "express";
import { statsService } from "./stats.service.js";

export const statsController = {
  async platform(_req: Request, res: Response) {
    res.json({ data: await statsService.platform() });
  },
};
