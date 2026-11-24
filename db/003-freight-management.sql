ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS distance_meters integer CHECK (distance_meters BETWEEN 0 AND 20000000),
  ADD COLUMN IF NOT EXISTS extras_cents integer NOT NULL DEFAULT 0 CHECK (extras_cents BETWEEN 0 AND 100000000),
  ADD COLUMN IF NOT EXISTS freight_cents integer CHECK (freight_cents BETWEEN 0 AND 100000000),
  ADD COLUMN IF NOT EXISTS cost_cents integer NOT NULL DEFAULT 0 CHECK (cost_cents BETWEEN 0 AND 100000000),
  ADD COLUMN IF NOT EXISTS payment_received boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS company_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  name text NOT NULL DEFAULT 'Estetcar',
  operating_notes text NOT NULL DEFAULT '',
  base_cents integer NOT NULL DEFAULT 0 CHECK (base_cents BETWEEN 0 AND 100000000),
  per_km_cents integer NOT NULL DEFAULT 0 CHECK (per_km_cents BETWEEN 0 AND 100000000),
  minimum_cents integer NOT NULL DEFAULT 0 CHECK (minimum_cents BETWEEN 0 AND 100000000),
  version integer NOT NULL DEFAULT 1
);

INSERT INTO company_settings (id) VALUES (1) ON CONFLICT DO NOTHING;