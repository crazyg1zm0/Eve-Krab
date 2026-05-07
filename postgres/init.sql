-- Eve-Krab PI Tracker — Database Schema
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

CREATE TABLE IF NOT EXISTS app_settings (
    id         SERIAL PRIMARY KEY,
    key        VARCHAR(50) NOT NULL UNIQUE,
    value      VARCHAR(200) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_log_lines_entry    ON log_lines(entry_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_mat  ON market_prices(mat_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_time ON market_prices(fetched_at);
CREATE INDEX IF NOT EXISTS idx_log_entries_date   ON log_entries(entry_date);

-- Default settings
INSERT INTO app_settings (key, value) VALUES
    ('price_hub',  'jita'),
    ('price_type', 'lowest_sell'),
    ('theme',      'dark')
ON CONFLICT (key) DO NOTHING;
