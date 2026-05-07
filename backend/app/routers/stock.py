from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models import Stock
from app.schemas import StockRow, AlertUpdate

router = APIRouter()


@router.get("/", response_model=List[StockRow])
async def get_stock(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stock))
    return result.scalars().all()


@router.patch("/alert")
async def update_alert(payload: AlertUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Stock).where(Stock.mat_id == payload.mat_id))
    row = result.scalar_one_or_none()
    if row:
        row.min_alert = payload.min_alert
        await db.commit()
    return {"ok": True}


@router.post("/ensure/{mat_id}")
async def ensure_stock_row(mat_id: str, db: AsyncSession = Depends(get_db)):
    """Create a stock row for a material if it doesn't exist yet."""
    result = await db.execute(select(Stock).where(Stock.mat_id == mat_id))
    row = result.scalar_one_or_none()
    if not row:
        db.add(Stock(mat_id=mat_id, quantity=0, min_alert=0))
        await db.commit()
    return {"ok": True}
