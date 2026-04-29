# Eve-Krab — EVE Online PI Tracker

Self-hosted Planetary Interaction tracker for a Wetware Mainframe operation.
Tracks stock levels, collection runs, factory usage, and live Jita sell prices
for 10 P1 materials across 14 characters.

## Stack
- **Frontend**: React + Vite (served by Nginx on port 80)
- **Backend**: Python FastAPI + APScheduler (systemd service on port 8000)
- **Database**: PostgreSQL 15 (local)
- **Prices**: ESI Tranquility — Jita 4-4 lowest sell, auto-syncs hourly

---

## First-Time Install (Ubuntu 22.04 LXC on Proxmox)

```bash
# Clone to /opt
git clone https://github.com/YOUR_USERNAME/eve-krab.git /opt/eve-krab
cd /opt/eve-krab

# Make scripts executable
chmod +x deploy/install.sh deploy/update.sh

# Run install (will prompt for your container's IP)
DB_PASS="your_strong_password" bash deploy/install.sh
```

App available at `http://YOUR_CONTAINER_IP`

---

## Updating

```bash
cd /opt/eve-krab
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
| Force price sync | `curl -X POST http://localhost:8000/api/prices/refresh` |

## Ports

| Service | Port |
|---|---|
| App (Nginx) | 80 |
| API (FastAPI) | 8000 |

## Materials Tracked (P1)
Reactive Metals, Water, Electrolytes, Oxygen, Chiral Structures,
Toxic Metals, Bacteria, Biofuels, Proteins, Industrial Fibers
