ALTER TABLE events RENAME COLUMN sample TO published;
ALTER TABLE events ALTER COLUMN published SET DEFAULT false;

-- The previous flag meant "sample"; published has the opposite meaning.
UPDATE events SET published = NOT published;
