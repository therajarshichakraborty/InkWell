import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { username } from "better-auth/plugins";
import { env } from "../config/env.js";
import { UPLOAD_URL_PATTERN } from "../config/uploads.js";
import { db } from "../db/index.js";
import * as schema from "../db/schema/index.js";

const RESERVED_USERNAMES = new Set(["api", "dashboard", "login", "signup", "settings", "admin", "explore", "search", "tags"]);

const MAX_BIO_LENGTH = 300;

const isValidUsername = (value: string) =>
  /^[a-z0-9_]+$/i.test(value) && !RESERVED_USERNAMES.has(value.toLowerCase());

export const auth = betterAuth({
  baseURL: env.APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.APP_URL],
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.username) {
            throw new APIError("BAD_REQUEST", { message: "Username is required" });
          }
        },
      },
      update: {
        before: async (changes) => {
          if (changes.image && !UPLOAD_URL_PATTERN.test(changes.image)) {
            throw new APIError("BAD_REQUEST", { message: "Upload the avatar first" });
          }
          if (typeof changes.bio === "string" && changes.bio.length > MAX_BIO_LENGTH) {
            throw new APIError("BAD_REQUEST", { message: `Bio must be ${MAX_BIO_LENGTH} characters or fewer` });
          }
        },
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      usernameValidator: isValidUsername,
    }),
  ],
});
