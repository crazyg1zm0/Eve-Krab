from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ── Stock ──────────────────────────────────────────────────────────────────────
class StockRow(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mat_id:    str
    quantity:  int
    min_alert: int
    updated_at: Optional[datetime]


class StockUpdate(BaseModel):
    mat_id:    str
    quantity:  int
    min_alert: Optional[int] = None


class AlertUpdate(BaseModel):
    mat_id:    str
    min_alert: int


# ── Log ────────────────────────────────────────────────────────────────────────
class LogLineIn(BaseModel):
    mat_id:   str
    quantity: int   # positive or negative


class LogEntryIn(BaseModel):
    entry_type: str              # collect | factory | adjust
    recipe:     Optional[str] = None
    runs:       Optional[int] = None
    note:       Optional[str] = None
    lines:      List[LogLineIn]
    entry_date: Optional[datetime] = None


class LogLineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    mat_id:   str
    quantity: int


class LogEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id:         int
    entry_type: str
    recipe:     Optional[str]
    runs:       Optional[int]
    note:       Optional[str]
    entry_date: datetime
    lines:      List[LogLineOut]


# ── Prices ─────────────────────────────────────────────────────────────────────
class PriceRow(BaseModel):
    mat_id:         str
    eve_type_id:    int
    adjusted_price: Optional[float]
    average_price:  Optional[float]
    fetched_at:     Optional[datetime]
