import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { database } from "@/db/client";
import { siteUrl } from "@/lib/seo/structured-data";

// Admin accounts only: there is no public sign-up, accounts come from `pnpm admin:create`.
// Needs BETTER_AUTH_SECRET (openssl rand -base64 32); Better Auth refuses to run
// in production without it.
export const auth = betterAuth({
  appName: "Knallköpp Sessionsplan",
  // Only this site's own hosts: production, this Vercel deployment and its branch URL.
  baseURL: {
    allowedHosts: [
      new URL(siteUrl).host,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_URL,
      "localhost:*",
    ].filter((host): host is string => Boolean(host)),
    fallback: siteUrl,
  },
  database: drizzleAdapter(database(), { provider: "pg", usePlural: true }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 256,
  },
  session: {
    expiresIn: 8 * 60 * 60,
    updateAge: 60 * 60,
  },
  // Counted in Postgres, so the limit holds across serverless instances. Rules are
  // keyed by path without the /api/auth prefix; the client IP comes from Vercel's
  // x-forwarded-for.
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 15 * 60, max: 10 },
    },
  },
  plugins: [nextCookies()],
});

export async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session !== null;
}
