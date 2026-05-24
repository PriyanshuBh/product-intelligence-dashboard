import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client";
import * as schema from "../db/schema";
import env from "../shared/configs/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification
    }
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true
  },
  basePath: "/api/auth",
  trustedOrigins: [env.CORS_ORIGIN],
  advanced: {
    crossDomain: true,
    useSecureCookies: env.NODE_ENV === "production" && !env.BETTER_AUTH_URL.includes("localhost")
  }
});
