# EVE PI Tracker — Wetware Mainframe Operation

Self-hosted PI tracking app. Tracks stock, collection runs, factory usage,
and ESI market prices for your 10 P1 materials.

## Stack
- **Frontend**: React + Vite (served by Nginx on port 80)
- **Backend**: Python FastAPI + APScheduler (systemd service on port 8000)
- **Database**: PostgreSQL (local)

---

## First-Time Install (Ubuntu 22.04 LXC)

```bash
# Clone to /opt
git clone https://github.com/YOUR_USERNAME/eve-pi-tracker.git /opt/eve-pi-tracker
cd /opt/eve-pi-tracker

# Make scripts executable
chmod +x deploy/install.sh deploy/update.sh

# Run install (will prompt for your host IP)
DB_PASS="your_strong_password" bash deploy/install.sh
```

---

## Updating

```bash
cd /opt/eve-pi-tracker
./deploy/update.sh
```

---

## Useful Commands

| Task | Command |
|---|---|
| View backend logs | `journalctl -u eve-pi-backend -f` |
| Restart backend | `systemctl restart eve-pi-backend` |
| Backend status | `systemctl status eve-pi-backend` |
| Nginx logs | `tail -f /var/log/nginx/error.log` |

## Ports
| Service | Port |
|---|---|
| App (Nginx) | 80 |
| API (FastAPI) | 8000 |
