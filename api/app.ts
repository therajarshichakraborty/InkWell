import { toNodeHandler } from "better-auth/node";
import express from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import helmetModule, { type HelmetOptions } from "helmet";
import { auth } from "./lib/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { apiRoutes } from "./routes.js";

type Helmet = (
  options?: Readonly<HelmetOptions>,
) => (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void;

// Helmet's CommonJS typings (which Vercel's compiler picks) put the middleware under `.default`.
const helmet = ("default" in helmetModule ? helmetModule.default : helmetModule) as Helmet;

export function createApp() {
  const app = express();

  app.set("trust proxy", true);
  app.disable("x-powered-by");
  app.use(helmet());

  app.all("/api/auth/{*path}", toNodeHandler(auth));

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

// Vercel detects this file as the Express entry point and serves the default export.
const app = createApp();

export default app;
