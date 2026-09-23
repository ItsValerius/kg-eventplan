import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { lt } from "drizzle-orm";
import { headers } from "next/headers";
import { after } from "next/server";
import { database } from "@/db/client";
import { rateLimits, sessions, verifications } from "@/db/schema";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/account";
import { PASSWORD_LINK_HOURS, sendPasswordLink } from "./account-mail";
import { siteUrl } from "@/lib/seo/structured-data";

// Admin accounts only: there is no public sign-up. Admins invite each other from /admin;
// the invitation is a password-reset link (see account-mail.ts). `pnpm admin:create` remains
// as the way in when no admin can sign in.
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
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: PASSWORD_MAX,
    sendResetPassword: ({ user, url }) => sendPasswordLink(user, url),
    resetPasswordTokenExpiresIn: PASSWORD_LINK_HOURS * 60 * 60,
    revokeSessionsOnPasswordReset: true,
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
  // Emails go out after the response, so a reset request for an unknown address takes as
  // long as one for a real account.
  advanced: {
    backgroundTasks: { handler: (promise) => after(promise) },
  },
  // Data minimisation (see /datenschutz): every sign-in removes expired sessions and
  // password links, and rate-limit counters (they hold IP addresses) older than a day.
  databaseHooks: {
    session: {
      create: {
        after: async () => {
          const db = database();
          await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
          await db.delete(verifications).where(lt(verifications.expiresAt, new Date()));
          await db.delete(rateLimits).where(lt(rateLimits.lastRequest, Date.now() - 24 * 60 * 60 * 1000));
        },
      },
    },
  },
  plugins: [nextCookies()],
});

// The signed-in admin, or null.
export async function currentAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function isAdmin() {
  return (await currentAdmin()) !== null;
}
