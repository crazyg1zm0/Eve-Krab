#!/bin/bash
# ============================================================
# Eve-Krab — Install Script
# Run as root on a fresh Ubuntu 22.04 LXC container
# ============================================================
set -e

APP_DIR="/opt/eve-krab"
VENV_DIR="$APP_DIR/venv"
FRONTEND_DIR="$APP_DIR/frontend"
DB_NAME="evepitracker"
DB_USER="evepi"
DB_PASS="${DB_PASS:-changeme}"

echo ""
echo "================================================"
echo "  Eve-Krab — Install"
echo "================================================"
echo ""

# ── 1. System packages ────────────────────────────────────────
echo "[1/7] Installing system packages..."
apt update -qq
apt install -y \
    python3 python3-pip python3-venv \
    postgresql postgresql-contrib \
    nginx \
    nodejs \
    git curl

# ── 2. PostgreSQL ─────────────────────────────────────────────
echo "[2/7] Configuring PostgreSQL..."
systemctl enable postgresql
systemctl start postgresql

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

sudo -u postgres psql -d $DB_NAME < "$APP_DIR/postgres/init.sql"

sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d $DB_NAME -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"

echo "    Database ready."

# ── 3. Python venv + backend deps ────────────────────────────
echo "[3/7] Setting up Python virtualenv..."
python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/pip" install --upgrade pip -q
"$VENV_DIR/bin/pip" install -r "$APP_DIR/backend/requirements.txt" -q
echo "    Python deps installed."

# ── 4. Write backend .env ────────────────────────────────────
echo "[4/7] Writing backend config..."
cat > "$APP_DIR/backend/.env" << EOF
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
EOF

# ── 5. Build frontend ─────────────────────────────────────────
echo "[5/7] Building frontend..."
cd "$FRONTEND_DIR"
npm install --silent

if [ -z "$VITE_API_URL" ]; then
    read -rp "    Enter the IP this will be accessed from (e.g. 192.168.1.50): " HOST_IP
    VITE_API_URL="http://$HOST_IP:8000"
fi

VITE_API_URL="$VITE_API_URL" npm run build --silent
echo "    Frontend built."

# ── 6. Nginx ──────────────────────────────────────────────────
echo "[6/7] Configuring Nginx..."
cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/eve-krab
ln -sf /etc/nginx/sites-available/eve-krab /etc/nginx/sites-enabled/eve-krab
rm -f /etc/nginx/sites-enabled/default

mkdir -p /var/www/eve-krab
cp -r "$FRONTEND_DIR/dist/." /var/www/eve-krab/

nginx -t
systemctl enable nginx
systemctl restart nginx
echo "    Nginx configured."

# ── 7. Systemd service ────────────────────────────────────────
echo "[7/7] Installing systemd service..."
cp "$APP_DIR/deploy/eve-pi-backend.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable eve-pi-backend
systemctl restart eve-pi-backend
echo "    Service started."

echo ""
echo "================================================"
echo "  Install complete!"
echo ""
echo "  App:      http://$(hostname -I | awk '{print $1}')"
echo "  API:      http://$(hostname -I | awk '{print $1}'):8000"
echo "  API docs: http://$(hostname -I | awk '{print $1}'):8000/docs"
echo ""
echo "  Logs:    journalctl -u eve-pi-backend -f"
echo "  Update:  cd $APP_DIR && ./deploy/update.sh"
echo "================================================"
echo ""
