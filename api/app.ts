import { toNodeHandler } from "better-auth/node";
import express from "express";
import helmet from "helmet";
import { auth } from "./lib/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { apiRoutes } from "./routes.js";

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
