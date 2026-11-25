CREATE TABLE bookings (
  id TEXT PRIMARY KEY NOT NULL,
  request_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  internal_notes TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL CHECK (source IN ('site', 'manual')),
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','confirmado','em_atendimento','concluido','cancelado')),
  created_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  updated_at TEXT NOT NULL DEFAULT (to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
);
CREATE INDEX bookings_by_schedule ON bookings(scheduled_date, scheduled_time, id);
CREATE INDEX bookings_by_status ON bookings(status, scheduled_date, scheduled_time, id);