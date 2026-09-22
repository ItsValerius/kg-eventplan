-- Databases upgraded from db/migrations/001_events.sql have the Postgres-generated name.
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_category";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_category_check";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "category";