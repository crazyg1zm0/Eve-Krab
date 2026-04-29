from sqlalchemy import Column, Integer, BigInteger, String, Numeric, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from app.database import Base


class Stock(Base):
    __tablename__ = "stock"
    id         = Column(Integer, primary_key=True)
    mat_id     = Column(String(50), nullable=False, unique=True)
    quantity   = Column(BigInteger, nullable=False, default=0)
    min_alert  = Column(BigInteger, nullable=False, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class LogEntry(Base):
    __tablename__ = "log_entries"
    id         = Column(Integer, primary_key=True)
    entry_type = Column(String(20), nullable=False)
    recipe     = Column(String(50))
    runs       = Column(Integer)
    note       = Column(Text)
    entry_date = Column(DateTime, nullable=False, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())
    lines      = relationship("LogLine", back_populates="entry", cascade="all, delete")


class LogLine(Base):
    __tablename__ = "log_lines"
    id       = Column(Integer, primary_key=True)
    entry_id = Column(Integer, ForeignKey("log_entries.id", ondelete="CASCADE"), nullable=False)
    mat_id   = Column(String(50), nullable=False)
    quantity = Column(BigInteger, nullable=False)
    entry    = relationship("LogEntry", back_populates="lines")


class MarketPrice(Base):
    __tablename__ = "market_prices"
    id             = Column(Integer, primary_key=True)
    mat_id         = Column(String(50), nullable=False)
    eve_type_id    = Column(Integer, nullable=False)
    adjusted_price = Column(Numeric(18, 4))
    average_price  = Column(Numeric(18, 4))
    fetched_at     = Column(DateTime, server_default=func.now())
