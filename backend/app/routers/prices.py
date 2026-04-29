from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from app.database import get_db
from app.models import MarketPrice
from app.schemas import PriceRow
from app.services.esi_service import ESIService

# All 10 P1 materials with their EVE type IDs
MATERIALS = [
    {"mat_id": "reactive_metals",   "eve_type_id": 2410},
    {"mat_id": "water",             "eve_type_id": 3645},
    {"mat_id": "electrolytes",      "eve_type_id": 2390},
    {"mat_id": "oxygen",            "eve_type_id": 2399},
    {"mat_id": "chiral_structures", "eve_type_id": 2401},
    {"mat_id": "toxic_metals",      "eve_type_id": 2400},
    {"mat_id": "bacteria",          "eve_type_id": 2393},
    {"mat_id": "biofuels",          "eve_type_id": 2397},
    {"mat_id": "proteins",          "eve_type_id": 2395},
    {"mat_id": "industrial_fibers", "eve_type_id": 2396},
]
TYPE_ID_MAP = {m["eve_type_id"]: m["mat_id"] for m in MATERIALS}
MAT_ID_MAP  = {m["mat_id"]: m["eve_type_id"] for m in MATERIALS}

router = APIRouter()


@router.get("/latest", response_model=List[PriceRow])
async def get_latest_prices(db: AsyncSession = Depends(get_db)):
    """Return the most recent price row for each material."""
    rows = []
    for mat in MATERIALS:
        result = await db.execute(
            select(MarketPrice)
            .where(MarketPrice.mat_id == mat["mat_id"])
            .order_by(desc(MarketPrice.fetched_at))
            .limit(1)
        )
        price = result.scalar_one_or_none()
        if price:
            rows.append(PriceRow(
                mat_id=price.mat_id,
                eve_type_id=price.eve_type_id,
                adjusted_price=float(price.adjusted_price) if price.adjusted_price else None,
                average_price=float(price.average_price) if price.average_price else None,
                fetched_at=price.fetched_at,
            ))
        else:
            rows.append(PriceRow(
                mat_id=mat["mat_id"],
                eve_type_id=mat["eve_type_id"],
                adjusted_price=None, average_price=None, fetched_at=None,
            ))
    return rows


@router.post("/refresh")
async def refresh_prices(db: AsyncSession = Depends(get_db)):
    """Fetch fresh prices from ESI and store them."""
    try:
        esi_prices = await ESIService.get_market_prices()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ESI error: {e}")

    updated = 0
    for mat in MATERIALS:
        p = esi_prices.get(mat["eve_type_id"])
        if p:
            db.add(MarketPrice(
                mat_id=mat["mat_id"],
                eve_type_id=mat["eve_type_id"],
                adjusted_price=p.get("adjusted_price"),
                average_price=p.get("average_price"),
            ))
            updated += 1

    await db.commit()
    return {"updated": updated, "total": len(MATERIALS)}
