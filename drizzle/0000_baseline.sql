CREATE TABLE "data_imports" (
	"name" text PRIMARY KEY NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" date NOT NULL,
	"time" time(0) NOT NULL,
	"location" text NOT NULL,
	"category" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	CONSTRAINT "events_title_length" CHECK (char_length(btrim("events"."title")) BETWEEN 1 AND 120),
	CONSTRAINT "events_season_date" CHECK ("events"."date" BETWEEN DATE '2026-09-01' AND DATE '2027-08-31'),
	CONSTRAINT "events_minute_time" CHECK (EXTRACT(SECOND FROM "events"."time") = 0),
	CONSTRAINT "events_location_length" CHECK (char_length(btrim("events"."location")) BETWEEN 1 AND 180),
	CONSTRAINT "events_category" CHECK ("events"."category" IN ('Brauchtum', 'Sitzung & Biwak', 'Party', 'Familie', 'Unterwegs')),
	CONSTRAINT "events_description_length" CHECK (char_length("events"."description") <= 2000)
);
--> statement-breakpoint
CREATE INDEX "events_chronological" ON "events" USING btree ("date","time","id");