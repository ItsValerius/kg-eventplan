CREATE TABLE events (
  id text PRIMARY KEY,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 120),
  date date NOT NULL CHECK (date BETWEEN DATE '2026-09-01' AND DATE '2027-08-31'),
  time time(0) without time zone NOT NULL CHECK (time < TIME '24:00' AND EXTRACT(SECOND FROM time) = 0),
  location text NOT NULL CHECK (char_length(btrim(location)) BETWEEN 1 AND 180),
  category text NOT NULL CHECK (category IN ('Brauchtum', 'Sitzung & Biwak', 'Party', 'Familie', 'Unterwegs')),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  sample boolean NOT NULL DEFAULT true
);
CREATE INDEX events_chronological ON events (date, time, id);

-- Remembers imports even if administrators later delete every event.
CREATE TABLE data_imports (
  name text PRIMARY KEY,
  imported_at timestamptz NOT NULL DEFAULT now()
);
