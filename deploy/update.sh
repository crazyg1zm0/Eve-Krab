#!/bin/bash
# ============================================================
# EVE PI Tracker — Update Script
# Run from /opt/eve-pi-tracker
# ============================================================
set -e

APP_DIR="/opt/eve-pi-tracker"
VENV_DIR="$APP_DIR/venv"
FRONTEND_DIR="$APP_DIR/frontend"

echo ""
echo "================================================"
echo "  EVE PI Tracker — Update"
echo "================================================"
echo ""

cd "$APP_DIR"

# ── 1. Pull latest code ───────────────────────────────────────
echo "[1/4] Pulling latest code..."
git pull
echo "    Done."

# ── 2. Update Python deps (in case requirements.txt changed) ─
echo "[2/4] Updating Python dependencies..."
"$VENV_DIR/bin/pip" install -r backend/requirements.txt -q
echo "    Done."

# ── 3. Rebuild frontend ───────────────────────────────────────
echo "[3/4] Rebuilding frontend..."
cd "$FRONTEND_DIR"
npm install --silent

# Preserve VITE_API_URL from existing .env if present
if [ -f "$APP_DIR/backend/.env" ]; then
    source "$APP_DIR/backend/.env" 2>/dev/null || true
fi
# Read from backend .env or fall back to current host IP
VITE_API_URL="${VITE_API_URL:-http://$(hostname -I | awk '{print $1}'):8000}"

VITE_API_URL="$VITE_API_URL" npm run build --silent
cp -r "$FRONTEND_DIR/dist/." /var/www/eve-pi-tracker/
echo "    Done."

# ── 4. Restart backend ───────────────────────────────────────
echo "[4/4] Restarting backend service..."
systemctl restart eve-pi-backend
sleep 2
systemctl is-active --quiet eve-pi-backend && echo "    Service running." || echo "    WARNING: service failed to start — check: journalctl -u eve-pi-backend -n 50"

echo ""
echo "================================================"
echo "  Update complete!"
echo "  App: http://$(hostname -I | awk '{print $1}')"
echo "================================================"
echo ""
