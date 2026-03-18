CREATE TABLE pulses (
  id            UUID PRIMARY KEY,
  timestamp     TIMESTAMPTZ NOT NULL,
  source        TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('event', 'metric', 'state', 'alert')),
  entity_type   TEXT NOT NULL CHECK (entity_type IN ('project', 'user', 'vendor', 'system')),
  entity_id     TEXT NOT NULL,
  severity      TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  payload       JSONB NOT NULL DEFAULT '{}',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  schema_version TEXT NOT NULL,
  ingested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pulses_timestamp ON pulses (timestamp DESC);
CREATE INDEX idx_pulses_id_source ON pulses (id, source);

CREATE TABLE onboarding (
  id          SERIAL PRIMARY KEY,
  max_bpm     INTEGER NOT NULL DEFAULT 60,
  configured  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO onboarding (id, max_bpm, configured) VALUES (1, 60, FALSE)
ON CONFLICT (id) DO NOTHING;
