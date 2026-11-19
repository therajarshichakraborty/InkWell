import type { Request, Response } from "express";
import { uploadsService } from "./uploads.service.js";

export const uploadsController = {
  async create(req: Request, res: Response) {
    res.status(201).json({ data: await uploadsService.saveImage(req.file) });
  },
};
