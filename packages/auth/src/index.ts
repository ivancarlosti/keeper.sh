import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { usernameOnly } from "@keeper.sh/auth-plugin-username-only";
import { database } from "@keeper.sh/database";
import * as authSchema from "@keeper.sh/database/auth-schema";
import env from "@keeper.sh/env/auth";
import type { BetterAuthPlugin } from "better-auth";

const plugins: BetterAuthPlugin[] = [];

if (env.NO_EMAIL_REQUIRED) {
  plugins.push(usernameOnly());
}

export const auth = betterAuth({
  database: drizzleAdapter(database, {
    provider: "pg",
    schema: authSchema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: !env.NO_EMAIL_REQUIRED,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins,
});
