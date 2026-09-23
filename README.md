# Knallköpp Sessionsplan 2026/2027

German public event calendar at `/` and password-protected event administration at `/admin`. Includes month filters, event details and individual iCalendar downloads. Administrators can add, edit, publish and delete dates; drafts never appear publicly.

## Development

Requires Node.js 20.12+ and Docker with Compose.

```sh
pnpm install
cp .env.example .env.local  # first setup only; preserve any existing secrets
pnpm db:up
pnpm mail:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

PostgreSQL 17 runs on `127.0.0.1:5433` with a named Docker volume. `.env.example` contains the matching local-only connection string. `pnpm db:down` stops the database without deleting the volume; `pnpm db:up` starts it again. Do not use `docker compose down -v` unless you intend to erase the database.

Set `BETTER_AUTH_SECRET` in `.env.local` (`openssl rand -base64 32`), then create an admin account for `/admin`:

```sh
pnpm admin:create you@example.com "Your Name"
```

The command prints a generated password once. Running it again for the same address sets a new password and ends that admin's sessions; `pnpm admin:remove you@example.com` deletes the account. There is no public sign-up.

After that, admins manage access themselves under **Zugänge** on `/admin`: an invitation creates the account and emails a link (valid 24 hours) with which the person sets their own password; the login page offers **Passwort vergessen?** with the same kind of link. Email goes out through the club's IONOS mailbox (`SMTP_USER`, `SMTP_PASSWORD`). Locally, `pnpm mail:up` starts a Mailpit container that catches every email instead of sending it; `.env.example` points `SMTP_HOST`/`SMTP_PORT` at it, and the inbox is at http://localhost:8025. `pnpm admin:create` stays available for when no admin can sign in.

## Database and existing dates

PostgreSQL is the source of truth. Drizzle ORM defines the typed schema in `db/schema.ts` and handles all application, seed and integration-test queries through the `node-postgres` driver. Dates and local German event times are stored as SQL `date` and `time without time zone`, preserving their displayed values. Each edit modifies one row, so simultaneous saves of different events cannot overwrite one another. Concurrent edits to the same event use last-write-wins.

`pnpm db:generate` creates a migration in `drizzle/` after a schema change; review its SQL (and add any data changes to it) before applying it. `pnpm db:migrate` applies pending migrations with Drizzle's migrator, which records them in `drizzle.__drizzle_migrations`. Run migrations before starting or building the app. Never use `drizzle-kit push` against production: changes made outside the migrator are not recorded, so later migrations try to apply them again. `pnpm db:studio` opens Drizzle Studio for local inspection.

On Vercel, production builds apply pending migrations automatically: `vercel.json` sets the build command to `pnpm db:deploy && pnpm build`, and `db:deploy` migrates only when `VERCEL_ENV` is `production`, over Neon's direct connection (`DATABASE_URL_UNPOOLED`), as Neon recommends for schema changes. Preview builds skip it because previews share the production database. The previous deployment keeps serving while the build runs and Vercel's instant rollback does not undo migrations, so keep migrations backward compatible: add columns first, and drop old ones in a later release.

`pnpm db:seed` is an explicit, one-time initialization: it imports `data/events.json` when present (or the previous `EVENT_DATA_DIR` location), otherwise the eight initial planning dates. To import a specific file, run `pnpm db:seed /absolute/path/events.json`. IDs are preserved and the original JSON is left untouched. Invalid imports roll back. A database that already has any events is left unchanged, so subsequent runs never overwrite edits or restore deleted events. Runtime reads never seed or fall back to initial data.

## Overview caching

Next.js Cache Components caches the public event query with the `season-events` tag. The overview is prerendered with this data:

- Server cache: after five minutes, the next request serves cached content and triggers a background refresh. After one hour without renewal, a request waits for fresh data.
- Admin Server Actions: after the Drizzle statement commits, `updateTag("season-events")` expires the tagged cache immediately. The next overview request waits for the updated published dates.
- Admin content: fresh database reads. Authentication and private admin content remain outside cached scopes. Every Server Action rechecks the session and validates its input with Zod before accessing PostgreSQL.
- Browser navigation cache: 30 seconds. The admin refreshes its router after mutations. Already-open visitor tabs are not updated live; reload to fetch changes. Direct SQL edits bypass tag invalidation and use the timed refresh fallback.

No Redis or polling is needed for this low-write calendar. Test cache behavior with a production build, since development caching differs.

## Sessionsplan PDF

Visitors can download the full published event list as a branded PDF. It is not generated per request: every successful admin save or delete regenerates it from the currently published events and uploads it to Vercel Blob (`@vercel/blob`, requires `BLOB_READ_WRITE_TOKEN`) at a fixed pathname, overwriting the previous version. `GET /sessionsplan.pdf` is a small Route Handler that looks up the current blob and streams it back with `Content-Disposition: attachment`, so the public download URL and filename stay stable regardless of where Blob actually hosts the file. The download link on the public overview only appears once a PDF exists, so it is hidden until an administrator has saved at least one event. PDF regeneration is best-effort — a failure is logged but never blocks the admin's save or delete. Serverless deployments (Vercel and similar) have a read-only filesystem at runtime, which is why this uses Blob storage rather than writing into `public/`. Outside Vercel (local `next dev` or `next start`) the PDF is written to `data/sessionsplan.pdf` instead, so local development needs no Blob token and never overwrites the production PDF; `lib/pdf/storage.ts` picks the backend from the `VERCEL` environment variable.

## Production

Set `DATABASE_URL` to your persistent PostgreSQL database, set a random `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), and connect a Vercel Blob store (provides `BLOB_READ_WRITE_TOKEN`) for the season plan PDF, set `SMTP_USER` and `SMTP_PASSWORD` for the club's IONOS mailbox, then run:

```sh
pnpm db:migrate
# Create each admin (prints a one-time password):
DATABASE_URL=… pnpm admin:create admin@example.com "Name"
# On the first deployment only, import the approved initial data if desired:
pnpm db:seed /absolute/path/events.json
pnpm build --webpack
pnpm start
```

The database must be reachable during the build to prerender the calendar. The included Compose credentials are for local development; use separate production credentials, database backups, and the TLS settings required by your database provider. Back up PostgreSQL, not the old JSON file.

Admin login uses [Better Auth](https://better-auth.com) (`lib/server/auth.ts`) with personal email and password accounts stored in PostgreSQL (`db/auth-schema.ts`). Passwords are hashed with scrypt; sessions live in the database for eight hours (refreshed hourly while in use), so signing out or removing an admin ends them at once. Cookies are `httpOnly`, `SameSite=Lax` and secure over HTTPS. Sign-in goes through `/api/auth`, which checks the request origin and limits each client IP to 10 attempts per 15 minutes; the counters live in PostgreSQL, so the limit holds across serverless instances. Only this site's own hosts (production, the current Vercel deployment and branch URLs, localhost) are accepted as the auth base URL. Next.js Server Actions perform their built-in origin checks, and every mutation independently requires a valid admin session. Better Auth refuses to start in production without `BETTER_AUTH_SECRET`.

The default Next.js cache is local to an app instance. For multiple replicas, configure a shared Next.js cache handler with coordinated tag invalidation. PostgreSQL is already shared; adding replicas alone does not coordinate their caches.

All initial 2026/2027 dates and times are planning data, not a confirmed club schedule. The migration converts them to unpublished drafts. New events also start as drafts; enable **Termin veröffentlichen** only when a date should appear on the public overview.

## Checks

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build --webpack
pnpm test:persistence
```

The integration test uses the configured database and cleans up only its uniquely named test events. It verifies German Zod errors, Drizzle persistence, publication state, database constraints and simultaneous inserts. Run it locally after migrating; do not point it at production. The production build additionally verifies that the Server Actions and cache boundaries compile together.

## Assets

Club logo: https://www.knallkoepp-golkrath.de/s/misc/logo.png (club-owned, sourced for this requested design).
Display font: Barlow Condensed Bold, self-hosted from Google Fonts; SIL Open Font License (see `public/fonts/OFL.txt`). The small original logo is retained at its native quality.


## UI development

Styling uses Tailwind CSS v4 with semantic theme tokens in `app/globals.css`. Shared controls are local shadcn/ui components in `components/ui`, configured with Base UI (`base-nova`) in `components.json`. No Radix UI components are used. Add components with `pnpm dlx shadcn@latest add <component>` and preserve the club theme. See `DESIGN.md` for variants and responsive conventions.
