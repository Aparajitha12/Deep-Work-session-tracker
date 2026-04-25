from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class SessionCreate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Title of the session"
    )
    goal: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional goal for the session"
    )
    scheduled_duration: int = Field(
        ...,
        gt=0,
        le=480,
        description="Duration in minutes. Maximum allowed is 480 (8 hours)."
    )


class SessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str = Field(..., description="Session title")
    goal: Optional[str] = Field(None, description="Session goal")
    scheduled_duration: int = Field(..., description="Planned duration in minutes")
    status: str = Field(..., description="Current session status")
    start_time: Optional[datetime] = Field(None, description="Time when session started")
    end_time: Optional[datetime] = Field(None, description="Time when session ended")
    created_at: Optional[datetime] = Field(None, description="Session creation timestamp")


class PauseRequest(BaseModel):
    reason: str = Field(
        ...,
        min_length=1,
        max_length=300,
        description="Reason for pausing the session"
    )


class HistoryItem(BaseModel):
    id: int
    title: str = Field(..., description="Session title")
    scheduled_duration: int = Field(..., description="Planned duration in minutes")
    status: str = Field(..., description="Final session status")
    pause_count: int = Field(..., ge=0, description="Number of times the session was paused")
    actual_duration: Optional[float] = Field(
        None,
        ge=0,
        description="Actual active duration in minutes"
    )
    completion_ratio: Optional[float] = Field(
        None,
        ge=0,
        description="Ratio of actual duration to planned duration"
    )
 
