from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.database import engine, Base
from app.routers import stock, log, prices, analytics
from app.services.esi_service import ESIService

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Also create app_settings defaults if missing
    from app.database import AsyncSessionLocal
    from app.models import AppSetting
    from sqlalchemy import select
    async with AsyncSessionLocal() as db:
        for key, val in [("price_hub", "jita"), ("price_type", "lowest_sell"), ("theme", "dark")]:
            r = await db.execute(select(AppSetting).where(AppSetting.key == key))
            if not r.scalar_one_or_none():
                db.add(AppSetting(key=key, value=val))
        await db.commit()

    scheduler.add_job(
        ESIService.scheduled_price_update,
        "interval", hours=1, id="price_update", replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="Eve-Krab PI Tracker", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stock.router,     prefix="/api/stock",     tags=["stock"])
app.include_router(log.router,       prefix="/api/log",       tags=["log"])
app.include_router(prices.router,    prefix="/api/prices",    tags=["prices"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


@app.get("/health")
async def health():
    return {"status": "ok"}
