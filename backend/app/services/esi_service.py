import httpx
from app.database import AsyncSessionLocal

ESI_BASE = "https://esi.evetech.net/latest"

# Trade hubs
HUBS = {
    "jita":    {"region": 10000002, "station": 60003760, "name": "Jita 4-4"},
    "amarr":   {"region": 10000043, "station": 60008494, "name": "Amarr VIII"},
    "dodixie": {"region": 10000032, "station": 60011866, "name": "Dodixie IX"},
    "hek":     {"region": 10000042, "station": 60005686, "name": "Hek VIII"},
}

# Complete PI material list P1-P4 with verified type IDs
ALL_PI_MATERIALS = [
    # P1
    {"mat_id": "bacteria",                     "name": "Bacteria",                     "eve_type_id": 2393,  "tier": 1},
    {"mat_id": "biofuels",                     "name": "Biofuels",                     "eve_type_id": 2396,  "tier": 1},
    {"mat_id": "biomass",                      "name": "Biomass",                      "eve_type_id": 3779,  "tier": 1},
    {"mat_id": "chiral_structures",            "name": "Chiral Structures",            "eve_type_id": 2401,  "tier": 1},
    {"mat_id": "electrolytes",                 "name": "Electrolytes",                 "eve_type_id": 2390,  "tier": 1},
    {"mat_id": "industrial_fibers",            "name": "Industrial Fibers",            "eve_type_id": 2397,  "tier": 1},
    {"mat_id": "oxidizing_compound",           "name": "Oxidizing Compound",           "eve_type_id": 2392,  "tier": 1},
    {"mat_id": "oxygen",                       "name": "Oxygen",                       "eve_type_id": 3683,  "tier": 1},
    {"mat_id": "plasmoids",                    "name": "Plasmoids",                    "eve_type_id": 2389,  "tier": 1},
    {"mat_id": "precious_metals",              "name": "Precious Metals",              "eve_type_id": 2399,  "tier": 1},
    {"mat_id": "proteins",                     "name": "Proteins",                     "eve_type_id": 2395,  "tier": 1},
    {"mat_id": "reactive_metals",              "name": "Reactive Metals",              "eve_type_id": 2398,  "tier": 1},
    {"mat_id": "silicon",                      "name": "Silicon",                      "eve_type_id": 9828,  "tier": 1},
    {"mat_id": "toxic_metals",                 "name": "Toxic Metals",                 "eve_type_id": 2400,  "tier": 1},
    {"mat_id": "water",                        "name": "Water",                        "eve_type_id": 3645,  "tier": 1},
    # P2
    {"mat_id": "biocells",                     "name": "Biocells",                     "eve_type_id": 2329,  "tier": 2},
    {"mat_id": "construction_blocks",          "name": "Construction Blocks",          "eve_type_id": 3828,  "tier": 2},
    {"mat_id": "consumer_electronics",         "name": "Consumer Electronics",         "eve_type_id": 9836,  "tier": 2},
    {"mat_id": "coolant",                      "name": "Coolant",                      "eve_type_id": 9832,  "tier": 2},
    {"mat_id": "enriched_uranium",             "name": "Enriched Uranium",             "eve_type_id": 44,    "tier": 2},
    {"mat_id": "fertilizer",                   "name": "Fertilizer",                   "eve_type_id": 3693,  "tier": 2},
    {"mat_id": "gen_enhanced_livestock",       "name": "Genetically Enhanced Livestock","eve_type_id": 15317, "tier": 2},
    {"mat_id": "livestock",                    "name": "Livestock",                    "eve_type_id": 3725,  "tier": 2},
    {"mat_id": "mechanical_parts",             "name": "Mechanical Parts",             "eve_type_id": 3689,  "tier": 2},
    {"mat_id": "microfiber_shielding",         "name": "Microfiber Shielding",         "eve_type_id": 2327,  "tier": 2},
    {"mat_id": "miniature_electronics",        "name": "Miniature Electronics",        "eve_type_id": 9842,  "tier": 2},
    {"mat_id": "nanites",                      "name": "Nanites",                      "eve_type_id": 2463,  "tier": 2},
    {"mat_id": "oxides",                       "name": "Oxides",                       "eve_type_id": 2317,  "tier": 2},
    {"mat_id": "polyaramids",                  "name": "Polyaramids",                  "eve_type_id": 2321,  "tier": 2},
    {"mat_id": "polytextiles",                 "name": "Polytextiles",                 "eve_type_id": 3695,  "tier": 2},
    {"mat_id": "rocket_fuel",                  "name": "Rocket Fuel",                  "eve_type_id": 9830,  "tier": 2},
    {"mat_id": "silicate_glass",               "name": "Silicate Glass",               "eve_type_id": 3697,  "tier": 2},
    {"mat_id": "superconductors",              "name": "Superconductors",              "eve_type_id": 9838,  "tier": 2},
    {"mat_id": "supertensile_plastics",        "name": "Supertensile Plastics",        "eve_type_id": 2312,  "tier": 2},
    {"mat_id": "synthetic_oil",                "name": "Synthetic Oil",                "eve_type_id": 3691,  "tier": 2},
    {"mat_id": "test_cultures",                "name": "Test Cultures",                "eve_type_id": 2319,  "tier": 2},
    {"mat_id": "transmitter",                  "name": "Transmitter",                  "eve_type_id": 9840,  "tier": 2},
    {"mat_id": "viral_agent",                  "name": "Viral Agent",                  "eve_type_id": 3775,  "tier": 2},
    {"mat_id": "water_cooled_cpu",             "name": "Water-Cooled CPU",             "eve_type_id": 2328,  "tier": 2},
    # P3
    {"mat_id": "biotech_research_reports",     "name": "Biotech Research Reports",     "eve_type_id": 2358,  "tier": 3},
    {"mat_id": "camera_drones",                "name": "Camera Drones",                "eve_type_id": 2345,  "tier": 3},
    {"mat_id": "condensates",                  "name": "Condensates",                  "eve_type_id": 2344,  "tier": 3},
    {"mat_id": "cryoprotectant_solution",      "name": "Cryoprotectant Solution",      "eve_type_id": 2367,  "tier": 3},
    {"mat_id": "data_chips",                   "name": "Data Chips",                   "eve_type_id": 17392, "tier": 3},
    {"mat_id": "gel_matrix_biopaste",          "name": "Gel-Matrix Biopaste",          "eve_type_id": 2348,  "tier": 3},
    {"mat_id": "guidance_systems",             "name": "Guidance Systems",             "eve_type_id": 9834,  "tier": 3},
    {"mat_id": "hazmat_detection_systems",     "name": "Hazmat Detection Systems",     "eve_type_id": 2366,  "tier": 3},
    {"mat_id": "hermetic_membranes",           "name": "Hermetic Membranes",           "eve_type_id": 2361,  "tier": 3},
    {"mat_id": "high_tech_transmitters",       "name": "High-Tech Transmitters",       "eve_type_id": 17898, "tier": 3},
    {"mat_id": "industrial_explosives",        "name": "Industrial Explosives",        "eve_type_id": 2360,  "tier": 3},
    {"mat_id": "neocoms",                      "name": "Neocoms",                      "eve_type_id": 2354,  "tier": 3},
    {"mat_id": "nuclear_reactors",             "name": "Nuclear Reactors",             "eve_type_id": 2352,  "tier": 3},
    {"mat_id": "planetary_vehicles",           "name": "Planetary Vehicles",           "eve_type_id": 9846,  "tier": 3},
    {"mat_id": "robotics",                     "name": "Robotics",                     "eve_type_id": 9848,  "tier": 3},
    {"mat_id": "smartfab_units",               "name": "Smartfab Units",               "eve_type_id": 2351,  "tier": 3},
    {"mat_id": "supercomputers",               "name": "Supercomputers",               "eve_type_id": 2349,  "tier": 3},
    {"mat_id": "synthetic_synapses",           "name": "Synthetic Synapses",           "eve_type_id": 2346,  "tier": 3},
    {"mat_id": "transcranial_microcontrollers","name": "Transcranial Microcontrollers","eve_type_id": 12836, "tier": 3},
    {"mat_id": "ukomi_superconductors",        "name": "Ukomi Super-Conductors",       "eve_type_id": 17136, "tier": 3},
    {"mat_id": "vaccines",                     "name": "Vaccines",                     "eve_type_id": 28974, "tier": 3},
    # P4
    {"mat_id": "broadcast_node",               "name": "Broadcast Node",               "eve_type_id": 2867,  "tier": 4},
    {"mat_id": "integrity_response_drones",    "name": "Integrity Response Drones",    "eve_type_id": 2868,  "tier": 4},
    {"mat_id": "nano_factory",                 "name": "Nano-Factory",                 "eve_type_id": 2869,  "tier": 4},
    {"mat_id": "organic_mortar_applicators",   "name": "Organic Mortar Applicators",   "eve_type_id": 2870,  "tier": 4},
    {"mat_id": "recursive_computing_module",   "name": "Recursive Computing Module",   "eve_type_id": 2871,  "tier": 4},
    {"mat_id": "self_harmonizing_power_core",  "name": "Self-Harmonizing Power Core",  "eve_type_id": 2872,  "tier": 4},
    {"mat_id": "sterile_conduits",             "name": "Sterile Conduits",             "eve_type_id": 2875,  "tier": 4},
    {"mat_id": "wetware_mainframe",            "name": "Wetware Mainframe",            "eve_type_id": 2876,  "tier": 4},
]

# Lookup maps
TYPE_ID_TO_MAT = {m["eve_type_id"]: m["mat_id"] for m in ALL_PI_MATERIALS}
MAT_TO_TYPE_ID = {m["mat_id"]: m["eve_type_id"] for m in ALL_PI_MATERIALS}
MAT_NAME_MAP   = {m["name"].lower(): m["mat_id"] for m in ALL_PI_MATERIALS}


class ESIService:

    @staticmethod
    async def _get_orders(type_id: int, region_id: int, order_type: str,
                          station_id: int, client: httpx.AsyncClient) -> tuple[list, list]:
        """Fetch orders, return (station_orders, all_orders)."""
        all_orders = []
        page = 1
        while True:
            try:
                r = await client.get(
                    f"{ESI_BASE}/markets/{region_id}/orders/",
                    params={"datasource": "tranquility", "order_type": order_type,
                            "type_id": type_id, "page": page},
                )
                r.raise_for_status()
                data = r.json()
                if not data:
                    break
                all_orders.extend(data)
                if page >= int(r.headers.get("X-Pages", 1)):
                    break
                page += 1
            except Exception as e:
                print(f"[ESI] Orders error type={type_id}: {e}")
                break
        station = [o for o in all_orders if o.get("location_id") == station_id]
        return station, all_orders

    @staticmethod
    async def get_price(type_id: int, hub_key: str, price_type: str,
                        client: httpx.AsyncClient) -> float | None:
        hub = HUBS.get(hub_key, HUBS["jita"])
        region_id  = hub["region"]
        station_id = hub["station"]

        try:
            if price_type == "lowest_sell":
                st, all_o = await ESIService._get_orders(type_id, region_id, "sell", station_id, client)
                use = st if st else all_o
                return min(use, key=lambda o: o["price"])["price"] if use else None

            elif price_type == "highest_buy":
                st, all_o = await ESIService._get_orders(type_id, region_id, "buy", station_id, client)
                use = st if st else all_o
                return max(use, key=lambda o: o["price"])["price"] if use else None

            elif price_type == "split":
                sell_st, sell_all = await ESIService._get_orders(type_id, region_id, "sell", station_id, client)
                buy_st,  buy_all  = await ESIService._get_orders(type_id, region_id, "buy",  station_id, client)
                sell = sell_st if sell_st else sell_all
                buy  = buy_st  if buy_st  else buy_all
                if not sell or not buy:
                    return None
                low  = min(sell, key=lambda o: o["price"])["price"]
                high = max(buy,  key=lambda o: o["price"])["price"]
                return (low + high) / 2
        except Exception as e:
            print(f"[ESI] Price error type={type_id}: {e}")
            return None

    @staticmethod
    async def fetch_prices(type_ids: list[int], hub_key: str = "jita",
                           price_type: str = "lowest_sell") -> dict:
        """Returns {type_id: price}."""
        results = {}
        async with httpx.AsyncClient(timeout=30) as client:
            for type_id in type_ids:
                p = await ESIService.get_price(type_id, hub_key, price_type, client)
                if p is not None:
                    results[type_id] = p
        return results

    @staticmethod
    async def scheduled_price_update(hub_key: str = "jita", price_type: str = "lowest_sell"):
        """Called hourly — updates prices for stocked materials only."""
        try:
            from app.models import MarketPrice, Stock, AppSetting
            from sqlalchemy import select
            async with AsyncSessionLocal() as db:
                # Read current price settings
                hub_row = await db.execute(select(AppSetting).where(AppSetting.key == "price_hub"))
                hub_setting = hub_row.scalar_one_or_none()
                if hub_setting:
                    hub_key = hub_setting.value

                type_row = await db.execute(select(AppSetting).where(AppSetting.key == "price_type"))
                type_setting = type_row.scalar_one_or_none()
                if type_setting:
                    price_type = type_setting.value

                # Only update stocked materials
                stock_result = await db.execute(select(Stock).where(Stock.quantity > 0))
                stocked = {s.mat_id for s in stock_result.scalars().all()}
                if not stocked:
                    return

                type_ids = [m["eve_type_id"] for m in ALL_PI_MATERIALS if m["mat_id"] in stocked]
                prices = await ESIService.fetch_prices(type_ids, hub_key, price_type)

                for mat in ALL_PI_MATERIALS:
                    if mat["mat_id"] not in stocked:
                        continue
                    p = prices.get(mat["eve_type_id"])
                    if p is not None:
                        db.add(MarketPrice(
                            mat_id=mat["mat_id"],
                            eve_type_id=mat["eve_type_id"],
                            adjusted_price=p,
                            average_price=p,
                        ))
                await db.commit()
                print(f"[ESI] Updated {len(prices)} prices — hub={hub_key} type={price_type}")
        except Exception as e:
            print(f"[ESI] Scheduled update failed: {e}")
