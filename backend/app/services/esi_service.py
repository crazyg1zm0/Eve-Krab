import httpx
from app.database import AsyncSessionLocal

ESI_BASE = "https://esi.evetech.net/latest"

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


class ESIService:
    @staticmethod
    async def get_market_prices() -> dict:
        """Fetch all market prices from ESI — returns dict keyed by type_id."""
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(f"{ESI_BASE}/markets/prices/?datasource=tranquility")
            r.raise_for_status()
            return {item["type_id"]: item for item in r.json()}

    @staticmethod
    async def scheduled_price_update():
        """Called hourly by APScheduler."""
        try:
            from app.models import MarketPrice
            prices = await ESIService.get_market_prices()
            async with AsyncSessionLocal() as db:
                for mat in MATERIALS:
                    p = prices.get(mat["eve_type_id"])
                    if p:
                        db.add(MarketPrice(
                            mat_id=mat["mat_id"],
                            eve_type_id=mat["eve_type_id"],
                            adjusted_price=p.get("adjusted_price"),
                            average_price=p.get("average_price"),
                        ))
                await db.commit()
        except Exception as e:
            print(f"[ESI] Scheduled price update failed: {e}")
