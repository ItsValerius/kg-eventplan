# Knallköpp Sessionsplan 2026/2027

German public event calendar at `/` and password-protected event administration at `/admin`. Includes month filters, event details and individual iCalendar downloads. Administrators can add, edit, publish and delete dates; drafts never appear publicly.

## Development

Requires Node.js 20.12+ and Docker with Compose.

```sh
pnpm install
cp .env.example .env.local  # first setup only; preserve any existing secrets
pnpm db:up
pnpm db:migrate
pnpm db:seed
pnpm dev
```

PostgreSQL 17 runs on `127.0.0.1:5433` with a named Docker volume. `.env.example` contains the matching local-only connection string. `pnpm db:down` stops the database without deleting the volume; `pnpm db:up` starts it again. Do not use `docker compose down -v` unless you intend to erase the database.

Without `ADMIN_PASSWORD`, development enables an explicitly labeled demo login. Use **Demo-Passwort einsetzen** on `/admin`, then **Anmelden**. Demo password: `knallkoepp-demo`. This fallback is disabled in production.

## Database and existing dates

PostgreSQL is the source of truth. Drizzle ORM defines the typed schema in `db/schema.ts` and handles all application, seed and integration-test queries through the `node-postgres` driver. Dates and local German event times are stored as SQL `date` and `time without time zone`, preserving their displayed values. Each edit modifies one row, so simultaneous saves of different events cannot overwrite one another. Concurrent edits to the same event use last-write-wins.

`pnpm db:migrate` applies Drizzle migrations from `drizzle/`. It also upgrades the earlier local schema in place and registers its baseline with Drizzle, so the existing Docker volume does not need to be recreated. `pnpm db:generate` creates a migration after a schema change; review its SQL before applying it. An advisory lock serializes the one-time legacy upgrade and imports. Run migrations before starting or building the app. `pnpm db:studio` opens Drizzle Studio for local inspection.

`pnpm db:seed` is an explicit, one-time initialization: it imports `data/events.json` when present (or the previous `EVENT_DATA_DIR` location), otherwise the eight initial planning dates. To import a specific file, run `pnpm db:seed /absolute/path/events.json`. IDs are preserved and the original JSON is left untouched. Invalid imports roll back. A database that already has any events is left unchanged, so subsequent runs never overwrite edits or restore deleted events. Runtime reads never seed or fall back to initial data.

## Overview caching

Next.js Cache Components caches the public event query with the `season-events` tag. The overview is prerendered with this data:

- Server cache: after five minutes, the next request serves cached content and triggers a background refresh. After one hour without renewal, a request waits for fresh data.
- Admin Server Actions: after the Drizzle statement commits, `updateTag("season-events")` expires the tagged cache immediately. The next overview request waits for the updated published dates.
- Admin content: fresh database reads. Authentication and private admin content remain outside cached scopes. Every Server Action rechecks the session and validates its input with Zod before accessing PostgreSQL.
- Browser navigation cache: 30 seconds. The admin refreshes its router after mutations. Already-open visitor tabs are not updated live; reload to fetch changes. Direct SQL edits bypass tag invalidation and use the timed refresh fallback.

No Redis or polling is needed for this low-write calendar. Test cache behavior with a production build, since development caching differs.

## Sessionsplan PDF

Visitors can download the full published event list as a branded PDF. It is not generated per request: every successful admin save or delete regenerates `public/sessionsplan.pdf` from the currently published events and writes it atomically, then it is served as a plain static file at `/sessionsplan.pdf`. The download link on the public overview only appears once that file exists, so it is hidden until an administrator has saved at least one event. PDF regeneration is best-effort — a failure is logged but never blocks the admin's save or delete. This requires the running process to have write access to `public/` at runtime, a new requirement this feature introduces (previously `public/` held only build-time static assets). As with the cache above, a multi-replica deployment would need shared storage or per-replica regeneration, since the file lives on one instance's local filesystem.

## Production

Set `DATABASE_URL` to your persistent PostgreSQL database, configure a strong `ADMIN_PASSWORD` and random `ADMIN_SESSION_SECRET`, then run:

```sh
pnpm db:migrate
# On the first deployment only, import the approved initial data if desired:
pnpm db:seed /absolute/path/events.json
pnpm build --webpack
pnpm start
```

The database must be reachable during the build to prerender the calendar. The included Compose credentials are for local development; use separate production credentials, database backups, and the TLS settings required by your database provider. Back up PostgreSQL, not the old JSON file.

Use HTTPS (production authentication uses secure cookies). Sessions last eight hours. Next.js Server Actions perform their built-in origin checks, and every mutation independently requires a valid admin session. The app disables admin login if no production password is configured.

The default Next.js cache and login rate limiter are local to an app instance. For multiple replicas, configure a shared Next.js cache handler with coordinated tag invalidation and distributed rate limiting. PostgreSQL is already shared; adding replicas alone does not coordinate their caches.

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
