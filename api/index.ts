import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./db/index.js";

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = createApp().listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received, shutting down`);

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
