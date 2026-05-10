from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timedelta
from app.database import get_db

router = APIRouter()


@router.get("/daily")
async def daily_collection(days: int = 14, db: AsyncSession = Depends(get_db)):
    """Per-material daily collection totals for multi-line chart."""
    since = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(text("""
        SELECT
            DATE_TRUNC('day', le.entry_date) AS day,
            ll.mat_id,
            SUM(ll.quantity) AS total
        FROM log_entries le
        JOIN log_lines ll ON le.id = ll.entry_id
        WHERE le.entry_type IN ('collect', 'set_total')
        AND ll.quantity > 0
        AND le.entry_date >= :since
        GROUP BY DATE_TRUNC('day', le.entry_date), ll.mat_id
        ORDER BY DATE_TRUNC('day', le.entry_date)
    """), {"since": since})

    # Build list of all days and materials
    rows = result.all()
    if not rows:
        return []

    # Collect unique days and materials
    days_set  = sorted(set(r.day for r in rows))
    mats_set  = sorted(set(r.mat_id for r in rows))

    # Build a lookup {day: {mat_id: total}}
    lookup = {}
    for r in rows:
        d = r.day
        if d not in lookup:
            lookup[d] = {}
        lookup[d][r.mat_id] = int(r.total)

    # Return one entry per day with all materials as keys
    output = []
    for day in days_set:
        entry = {"day": day.strftime("%d %b")}
        for mat in mats_set:
            entry[mat] = lookup[day].get(mat, 0)
        output.append(entry)

    return {"data": output, "materials": mats_set}


@router.get("/per-material")
async def per_material(db: AsyncSession = Depends(get_db)):
    collected = await db.execute(text("""
        SELECT ll.mat_id, SUM(ll.quantity) AS total
        FROM log_lines ll
        JOIN log_entries le ON le.id = ll.entry_id
        WHERE le.entry_type IN ('collect', 'set_total')
        AND ll.quantity > 0
        GROUP BY ll.mat_id
    """))
    factory = await db.execute(text("""
        SELECT ll.mat_id, SUM(ABS(ll.quantity)) AS total
        FROM log_lines ll
        JOIN log_entries le ON le.id = ll.entry_id
        WHERE le.entry_type = 'factory'
        GROUP BY ll.mat_id
    """))
    c = {r.mat_id: int(r.total) for r in collected.all()}
    f = {r.mat_id: int(r.total) for r in factory.all()}
    all_ids = set(list(c.keys()) + list(f.keys()))
    return [{"mat_id": m, "collected": c.get(m,0), "sent_factory": f.get(m,0)} for m in all_ids]
