ALTER TABLE "events" ADD COLUMN "host" text;--> statement-breakpoint
-- Existing titles read "Host – Title": move the part before the first dash into host.
UPDATE "events" SET
  "host" = btrim(substring("title" from '^(.+?)\s[–-]\s')),
  "title" = btrim(regexp_replace("title", '^.+?\s[–-]\s', ''))
WHERE "title" ~ '^.+?\s[–-]\s.+';--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_host_length" CHECK (char_length(btrim("events"."host")) BETWEEN 1 AND 120);