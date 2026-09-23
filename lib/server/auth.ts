import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lt } from "drizzle-orm";
import { headers } from "next/headers";
import { database } from "@/db/client";
import { rateLimits, sessions } from "@/db/schema";
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
  // Data minimisation (see /datenschutz): every sign-in removes expired sessions and
  // rate-limit counters (they hold IP addresses) that are older than a day.
  databaseHooks: {
    session: {
      create: {
        after: async () => {
          const db = database();
          await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
          await db.delete(rateLimits).where(lt(rateLimits.lastRequest, Date.now() - 24 * 60 * 60 * 1000));
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export async function isAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session !== null;
}
