import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { HttpError } from "../lib/http-error.js";

const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Error &&
    error.cause instanceof Error &&
    "code" in error.cause &&
    error.cause.code === UNIQUE_VIOLATION
  );
}

function toHttpError(error: unknown) {
  if (error instanceof HttpError) return error;
  if (error instanceof MulterError) {
    return error.code === "LIMIT_FILE_SIZE"
      ? HttpError.payloadTooLarge("Images must be 5 MB or smaller")
      : HttpError.badRequest("Upload a single image");
  }
  if (isUniqueViolation(error)) return HttpError.conflict("That already exists, try again");
  return null;
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(HttpError.notFound("Route"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const httpError = toHttpError(error);

  if (!httpError) {
    console.error(error);
    res.status(500).json({ error: { code: "INTERNAL", message: "Something went wrong" } });
    return;
  }

  res.status(httpError.status).json({ error: { code: httpError.code, message: httpError.message } });
}
