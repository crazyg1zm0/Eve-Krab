from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import LogEntry, LogLine, Stock
from app.schemas import LogEntryIn, LogEntryOut

router = APIRouter()


@router.get("/", response_model=List[LogEntryOut])
async def get_log(limit: int = 200, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LogEntry)
        .options(selectinload(LogEntry.lines))
        .order_by(LogEntry.entry_date.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/", response_model=LogEntryOut)
async def create_log_entry(payload: LogEntryIn, db: AsyncSession = Depends(get_db)):
    entry = LogEntry(
        entry_type=payload.entry_type,
        recipe=payload.recipe,
        runs=payload.runs,
        note=payload.note,
        entry_date=payload.entry_date or datetime.utcnow(),
    )
    db.add(entry)
    await db.flush()

    for line in payload.lines:
        db.add(LogLine(entry_id=entry.id, mat_id=line.mat_id, quantity=line.quantity))

        # Ensure stock row exists
        result = await db.execute(select(Stock).where(Stock.mat_id == line.mat_id))
        stock_row = result.scalar_one_or_none()

        if payload.set_as_total and line.quantity >= 0:
            # Set as total mode — replace the value, log the diff
            if stock_row:
                stock_row.quantity = line.quantity
            else:
                db.add(Stock(mat_id=line.mat_id, quantity=line.quantity))
        else:
            # Normal add/subtract mode
            if stock_row:
                stock_row.quantity = stock_row.quantity + line.quantity
            else:
                db.add(Stock(mat_id=line.mat_id, quantity=max(0, line.quantity)))

    await db.commit()
    result = await db.execute(
        select(LogEntry)
        .options(selectinload(LogEntry.lines))
        .where(LogEntry.id == entry.id)
    )
    return result.scalar_one()


@router.delete("/{entry_id}")
async def delete_log_entry(entry_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LogEntry)
        .options(selectinload(LogEntry.lines))
        .where(LogEntry.id == entry_id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        return {"ok": False}
    # Only reverse non-set-as-total entries (collect/factory/adjust)
    if entry.entry_type != "set_total":
        for line in entry.lines:
            r = await db.execute(select(Stock).where(Stock.mat_id == line.mat_id))
            row = r.scalar_one_or_none()
            if row:
                row.quantity = row.quantity - line.quantity
    await db.delete(entry)
    await db.commit()
    return {"ok": True}
