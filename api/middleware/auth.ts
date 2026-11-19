import { fromNodeHeaders } from "better-auth/node";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth.js";
import { HttpError } from "../lib/http-error.js";

async function sessionUserId(req: Request) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  return session?.user.id ?? null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = await sessionUserId(req);

  if (!userId) throw HttpError.unauthorized();

  res.locals.userId = userId;
  res.locals.viewerId = userId;
  next();
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  res.locals.viewerId = await sessionUserId(req);
  next();
}
