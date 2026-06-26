import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth, keycloak } from "better-auth/plugins";

import { db } from "../db/client";

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

const betterAuthUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  secret: getRequiredEnv("BETTER_AUTH_SECRET"),
  baseURL: betterAuthUrl,
  trustedOrigins: [
    betterAuthUrl,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  plugins: [
    genericOAuth({
      config: [
        keycloak({
          clientId: getRequiredEnv("KEYCLOAK_CLIENT_ID"),
          clientSecret: getRequiredEnv("KEYCLOAK_CLIENT_SECRET"),
          issuer: getRequiredEnv("KEYCLOAK_ISSUER"),
          pkce: true,
        }),
      ],
    }),
    nextCookies(),
  ],
});
