#!/bin/bash
# ============================================================
# Eve-Krab — Database Migration (v1 → v2)
# Run once on existing installs to add app_settings table
# ============================================================
set -e

DB_NAME="evepitracker"
DB_USER="evepi"

echo "Running v2 database migration..."

sudo -u postgres psql -d $DB_NAME << 'SQLEOF'
-- Add app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_settings (
    id         SERIAL PRIMARY KEY,
    key        VARCHAR(50) NOT NULL UNIQUE,
    value      VARCHAR(200) NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert defaults
INSERT INTO app_settings (key, value) VALUES
    ('price_hub',  'jita'),
    ('price_type', 'lowest_sell'),
    ('theme',      'dark')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO evepi;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO evepi;
SQLEOF

echo "Migration complete."
