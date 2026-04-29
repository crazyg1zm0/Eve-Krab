from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import LogEntry, LogLine, Stock

router = APIRouter()


@router.get("/daily")
async def daily_collection(days: int = 14, db: AsyncSession = Depends(get_db)):
    """Total units collected per day for the area chart."""
    since = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(
        select(
            func.date_trunc("day", LogEntry.entry_date).label("day"),
            func.sum(LogLine.quantity).label("total"),
        )
        .join(LogLine, LogEntry.id == LogLine.entry_id)
        .where(LogEntry.entry_type == "collect")
        .where(LogEntry.entry_date >= since)
        .where(LogLine.quantity > 0)
        .group_by(func.date_trunc("day", LogEntry.entry_date))
        .order_by(func.date_trunc("day", LogEntry.entry_date))
    )
    return [{"day": row.day.strftime("%d %b"), "units": int(row.total)} for row in result.all()]


@router.get("/per-material")
async def per_material(db: AsyncSession = Depends(get_db)):
    """Collected vs sent to factory totals per material."""
    collected = await db.execute(
        select(LogLine.mat_id, func.sum(LogLine.quantity).label("total"))
        .join(LogEntry, LogEntry.id == LogLine.entry_id)
        .where(LogEntry.entry_type == "collect")
        .where(LogLine.quantity > 0)
        .group_by(LogLine.mat_id)
    )
    factory = await db.execute(
        select(LogLine.mat_id, func.sum(func.abs(LogLine.quantity)).label("total"))
        .join(LogEntry, LogEntry.id == LogLine.entry_id)
        .where(LogEntry.entry_type == "factory")
        .group_by(LogLine.mat_id)
    )
    c = {r.mat_id: int(r.total) for r in collected.all()}
    f = {r.mat_id: int(r.total) for r in factory.all()}
    all_ids = set(list(c.keys()) + list(f.keys()))
    return [{"mat_id": m, "collected": c.get(m, 0), "sent_factory": f.get(m, 0)} for m in all_ids]
