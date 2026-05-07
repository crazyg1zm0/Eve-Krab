from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
from app.database import get_db, AsyncSessionLocal
from app.models import MarketPrice, Stock, AppSetting
from app.schemas import PriceRow
from app.services.esi_service import ESIService, ALL_PI_MATERIALS

router = APIRouter()

MAT_BY_ID = {m["mat_id"]: m for m in ALL_PI_MATERIALS}


@router.get("/latest", response_model=List[PriceRow])
async def get_latest_prices(db: AsyncSession = Depends(get_db)):
    """Return most recent price for each stocked material."""
    # Only return prices for materials with stock
    stock_result = await db.execute(select(Stock).where(Stock.quantity > 0))
    stocked_ids = {s.mat_id for s in stock_result.scalars().all()}

    rows = []
    for mat in ALL_PI_MATERIALS:
        if mat["mat_id"] not in stocked_ids:
            continue
        result = await db.execute(
            select(MarketPrice)
            .where(MarketPrice.mat_id == mat["mat_id"])
            .order_by(desc(MarketPrice.fetched_at))
            .limit(1)
        )
        price = result.scalar_one_or_none()
        rows.append(PriceRow(
            mat_id=mat["mat_id"],
            eve_type_id=mat["eve_type_id"],
            adjusted_price=float(price.adjusted_price) if price and price.adjusted_price else None,
            average_price=float(price.average_price) if price and price.average_price else None,
            fetched_at=price.fetched_at if price else None,
        ))
    return rows


@router.post("/refresh")
async def refresh_prices(
    hub:        Optional[str] = None,
    price_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Manually trigger a price refresh. Uses saved settings if not specified."""
    # Load settings from DB if not overridden
    if not hub:
        r = await db.execute(select(AppSetting).where(AppSetting.key == "price_hub"))
        s = r.scalar_one_or_none()
        hub = s.value if s else "jita"
    if not price_type:
        r = await db.execute(select(AppSetting).where(AppSetting.key == "price_type"))
        s = r.scalar_one_or_none()
        price_type = s.value if s else "lowest_sell"

    # Only fetch for stocked materials
    stock_result = await db.execute(select(Stock).where(Stock.quantity > 0))
    stocked = {s.mat_id for s in stock_result.scalars().all()}
    if not stocked:
        return {"updated": 0, "total": 0, "hub": hub, "price_type": price_type,
                "message": "No stocked materials to price"}

    type_ids = [m["eve_type_id"] for m in ALL_PI_MATERIALS if m["mat_id"] in stocked]

    try:
        prices = await ESIService.fetch_prices(type_ids, hub, price_type)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ESI error: {e}")

    async with AsyncSessionLocal() as write_db:
        for mat in ALL_PI_MATERIALS:
            if mat["mat_id"] not in stocked:
                continue
            p = prices.get(mat["eve_type_id"])
            if p is not None:
                write_db.add(MarketPrice(
                    mat_id=mat["mat_id"],
                    eve_type_id=mat["eve_type_id"],
                    adjusted_price=p,
                    average_price=p,
                ))
        await write_db.commit()

    return {
        "updated": len(prices),
        "total": len(type_ids),
        "hub": hub,
        "price_type": price_type,
    }


@router.get("/settings")
async def get_price_settings(db: AsyncSession = Depends(get_db)):
    """Return current price hub and type settings."""
    hub_r  = await db.execute(select(AppSetting).where(AppSetting.key == "price_hub"))
    type_r = await db.execute(select(AppSetting).where(AppSetting.key == "price_type"))
    theme_r = await db.execute(select(AppSetting).where(AppSetting.key == "theme"))
    hub_s   = hub_r.scalar_one_or_none()
    type_s  = type_r.scalar_one_or_none()
    theme_s = theme_r.scalar_one_or_none()
    return {
        "price_hub":  hub_s.value  if hub_s  else "jita",
        "price_type": type_s.value if type_s else "lowest_sell",
        "theme":      theme_s.value if theme_s else "dark",
    }


@router.post("/settings")
async def save_price_settings(
    price_hub:  Optional[str] = None,
    price_type: Optional[str] = None,
    theme:      Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Save price hub/type settings."""
    valid_hubs  = {"jita", "amarr", "dodixie", "hek"}
    valid_types = {"lowest_sell", "highest_buy", "split"}
    valid_themes = {"dark", "light"}

    updates = {}
    if price_hub  and price_hub  in valid_hubs:  updates["price_hub"]  = price_hub
    if price_type and price_type in valid_types:  updates["price_type"] = price_type
    if theme      and theme      in valid_themes: updates["theme"]      = theme

    for key, value in updates.items():
        r = await db.execute(select(AppSetting).where(AppSetting.key == key))
        s = r.scalar_one_or_none()
        if s:
            s.value = value
        else:
            db.add(AppSetting(key=key, value=value))

    await db.commit()
    return {"ok": True, "updated": updates}
