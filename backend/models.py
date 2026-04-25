from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, CheckConstraint, String, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

VALID_STATUSES = ('scheduled','active','paused','completed','interrupted','abandoned','overdue')

class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        CheckConstraint(f"status IN {VALID_STATUSES}", name="valid_status"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(Text, nullable=False)
    goal = Column(Text)
    scheduled_duration = Column(Integer, nullable=False)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    status = Column(Text, default="scheduled", nullable=False)
    created_at = Column(DateTime, default=func.now())

    interruptions = relationship("Interruption", back_populates="session", cascade="all, delete-orphan")

class Interruption(Base):
    __tablename__ = "interruptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False)
    reason = Column(Text, nullable=False)
    pause_time = Column(DateTime, default=func.now())

    session = relationship("Session", back_populates="interruptions")
