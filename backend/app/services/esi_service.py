import httpx
from app.database import AsyncSessionLocal

ESI_BASE = "https://esi.evetech.net/latest"
THE_FORGE_REGION = 10000002
JITA_STATION_ID = 60003760

MATERIALS = [
    {"mat_id": "reactive_metals",   "eve_type_id": 2398},
    {"mat_id": "water",             "eve_type_id": 3645},
    {"mat_id": "electrolytes",      "eve_type_id": 2390},
    {"mat_id": "oxygen",            "eve_type_id": 3683},
    {"mat_id": "chiral_structures", "eve_type_id": 2401},
    {"mat_id": "toxic_metals",      "eve_type_id": 2400},
    {"mat_id": "bacteria",          "eve_type_id": 2393},
    {"mat_id": "biofuels",          "eve_type_id": 2396},
    {"mat_id": "proteins",          "eve_type_id": 2395},
    {"mat_id": "industrial_fibers", "eve_type_id": 2397},
]


class ESIService:

    @staticmethod
    async def get_jita_sell_price(type_id: int, client: httpx.AsyncClient):
        try:
            r = await client.get(
                f"{ESI_BASE}/markets/{THE_FORGE_REGION}/orders/",
                params={"datasource": "tranquility", "order_type": "sell", "type_id": type_id},
            )
            r.raise_for_status()
            orders = r.json()
            if not orders:
                return None
            jita = [o for o in orders if o.get("location_id") == JITA_STATION_ID]
            use = jita if jita else orders
            lowest = min(use, key=lambda o: o["price"])
            return {"lowest_sell": lowest["price"]}
        except Exception as e:
            print(f"[ESI] Failed type {type_id}: {e}")
            return None

    @staticmethod
    async def get_all_jita_prices() -> dict:
        results = {}
        async with httpx.AsyncClient(timeout=30) as client:
            for mat in MATERIALS:
                price = await ESIService.get_jita_sell_price(mat["eve_type_id"], client)
                if price:
                    results[mat["eve_type_id"]] = price
        return results

    @staticmethod
    async def scheduled_price_update():
        try:
            from app.models import MarketPrice
            prices = await ESIService.get_all_jita_prices()
            async with AsyncSessionLocal() as db:
                for mat in MATERIALS:
                    p = prices.get(mat["eve_type_id"])
                    if p:
                        db.add(MarketPrice(
                            mat_id=mat["mat_id"],
                            eve_type_id=mat["eve_type_id"],
                            adjusted_price=p.get("lowest_sell"),
                            average_price=p.get("lowest_sell"),
                        ))
                await db.commit()
            print(f"[ESI] Price update complete - {len(prices)}/10 updated")
        except Exception as e:
            print(f"[ESI] Scheduled update failed: {e}")
