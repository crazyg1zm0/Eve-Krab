-- EVE PI Tracker — Wetware Mainframe Operation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS stock (
    id         SERIAL PRIMARY KEY,
    mat_id     VARCHAR(50) NOT NULL UNIQUE,
    quantity   BIGINT NOT NULL DEFAULT 0,
    min_alert  BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_entries (
    id           SERIAL PRIMARY KEY,
    entry_type   VARCHAR(20) NOT NULL,
    recipe       VARCHAR(50),
    runs         INTEGER,
    note         TEXT,
    entry_date   TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_lines (
    id           SERIAL PRIMARY KEY,
    entry_id     INTEGER NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
    mat_id       VARCHAR(50) NOT NULL,
    quantity     BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS market_prices (
    id             SERIAL PRIMARY KEY,
    mat_id         VARCHAR(50) NOT NULL,
    eve_type_id    INTEGER NOT NULL,
    adjusted_price NUMERIC(18,4),
    average_price  NUMERIC(18,4),
    fetched_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_lines_entry    ON log_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_mat  ON market_prices(mat_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_time ON market_prices(fetched_at);
CREATE INDEX IF NOT EXISTS idx_log_entries_date   ON log_entries(entry_date);

INSERT INTO stock (mat_id, quantity, min_alert) VALUES
    ('reactive_metals',   0, 46080),
    ('water',             0, 46080),
    ('electrolytes',      0, 30720),
    ('oxygen',            0, 15360),
    ('chiral_structures', 0, 15360),
    ('toxic_metals',      0, 30720),
    ('bacteria',          0, 46080),
    ('biofuels',          0, 15360),
    ('proteins',          0, 30720),
    ('industrial_fibers', 0, 0)
ON CONFLICT (mat_id) DO NOTHING;
