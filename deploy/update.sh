#!/bin/bash
# ============================================================
# Eve-Krab — Update Script
# Run from /opt/eve-krab
# ============================================================
set -e

APP_DIR="/opt/eve-krab"
VENV_DIR="$APP_DIR/venv"
FRONTEND_DIR="$APP_DIR/frontend"

echo ""
echo "================================================"
echo "  Eve-Krab — Update"
echo "================================================"
echo ""

cd "$APP_DIR"

echo "[1/4] Pulling latest code..."
git pull
echo "    Done."

echo "[2/4] Updating Python dependencies..."
"$VENV_DIR/bin/pip" install -r backend/requirements.txt -q
echo "    Done."

echo "[3/4] Rebuilding frontend..."
cd "$FRONTEND_DIR"
npm install --silent

# Read VITE_API_URL from backend .env
if [ -f "$APP_DIR/backend/.env" ]; then
    export $(grep -v '^#' "$APP_DIR/backend/.env" | xargs) 2>/dev/null || true
fi
VITE_API_URL="${VITE_API_URL:-http://$(hostname -I | awk '{print $1}'):8000}"

VITE_API_URL="$VITE_API_URL" npm run build --silent
cp -r "$FRONTEND_DIR/dist/." /var/www/eve-krab/
echo "    Done."

echo "[4/4] Restarting backend service..."
systemctl restart eve-pi-backend
sleep 2
systemctl is-active --quiet eve-pi-backend \
    && echo "    Service running." \
    || echo "    WARNING: service failed — check: journalctl -u eve-pi-backend -n 50"

echo ""
echo "================================================"
echo "  Update complete!"
echo "  App: http://$(hostname -I | awk '{print $1}')"
echo "================================================"
echo ""
