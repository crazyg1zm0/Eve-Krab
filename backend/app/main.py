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
    scheduler.add_job(
        ESIService.scheduled_price_update,
        "interval", hours=1, id="price_update", replace_existing=True,
    )
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(title="EVE PI Tracker", version="1.0.0", lifespan=lifespan)

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
