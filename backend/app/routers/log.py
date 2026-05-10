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
    entry_date = payload.entry_date or datetime.utcnow()

    if payload.set_as_total:
        # ── SET AS TOTAL MODE ─────────────────────────────────────────────────
        # Compare new totals against current stock.
        # If new > old → auto-log the difference as a 'collect' entry.
        # If new < old → auto-log the difference as an 'adjust' entry (sold/used).
        # Then update stock to the new total.

        collect_lines = []   # materials that went up
        adjust_lines  = []   # materials that went down

        for line in payload.lines:
            result = await db.execute(select(Stock).where(Stock.mat_id == line.mat_id))
            stock_row = result.scalar_one_or_none()
            old_qty = int(stock_row.quantity) if stock_row else 0
            new_qty = int(line.quantity)
            diff    = new_qty - old_qty

            if diff > 0:
                collect_lines.append((line.mat_id, diff))
            elif diff < 0:
                adjust_lines.append((line.mat_id, diff))  # negative value

            # Update stock to new total
            if stock_row:
                stock_row.quantity = new_qty
            else:
                db.add(Stock(mat_id=line.mat_id, quantity=new_qty))

        # Log the set_total entry (stores the absolute values for reference)
        entry = LogEntry(
            entry_type="set_total",
            note=payload.note,
            entry_date=entry_date,
        )
        db.add(entry)
        await db.flush()
        for line in payload.lines:
            db.add(LogLine(entry_id=entry.id, mat_id=line.mat_id, quantity=line.quantity))

        # Auto-log a collect entry for materials that increased
        if collect_lines:
            collect_entry = LogEntry(
                entry_type="collect",
                note=f"Auto from stock update: {payload.note or ''}".strip(": "),
                entry_date=entry_date,
            )
            db.add(collect_entry)
            await db.flush()
            for mat_id, diff in collect_lines:
                db.add(LogLine(entry_id=collect_entry.id, mat_id=mat_id, quantity=diff))

        # Auto-log an adjust entry for materials that decreased
        if adjust_lines:
            adjust_entry = LogEntry(
                entry_type="adjust",
                note=f"Auto from stock update (decrease): {payload.note or ''}".strip(": "),
                entry_date=entry_date,
            )
            db.add(adjust_entry)
            await db.flush()
            for mat_id, diff in adjust_lines:
                db.add(LogLine(entry_id=adjust_entry.id, mat_id=mat_id, quantity=diff))

    else:
        # ── NORMAL ADD/SUBTRACT MODE ──────────────────────────────────────────
        entry = LogEntry(
            entry_type=payload.entry_type,
            recipe=payload.recipe,
            runs=payload.runs,
            note=payload.note,
            entry_date=entry_date,
        )
        db.add(entry)
        await db.flush()

        for line in payload.lines:
            db.add(LogLine(entry_id=entry.id, mat_id=line.mat_id, quantity=line.quantity))
            result = await db.execute(select(Stock).where(Stock.mat_id == line.mat_id))
            stock_row = result.scalar_one_or_none()
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
