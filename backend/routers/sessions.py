from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession
from database import get_db
from schemas import SessionCreate, SessionOut, PauseRequest, HistoryItem
from typing import List
import crud

router = APIRouter(prefix="/sessions", tags=["sessions"])

def _raise(err: str, code: int = 400):
    raise HTTPException(status_code=code, detail=err)

@router.post(
    "/",
    response_model=SessionOut,
    status_code=status.HTTP_201_CREATED,
    operation_id="createSession",
    summary="Schedule a new work session",
    description="Creates a new session with a title, optional goal, and scheduled duration in minutes.",
)
def create(data: SessionCreate, db: DBSession = Depends(get_db)):
    return crud.create_session(db, data)

@router.get(
    "/history",
    response_model=List[HistoryItem],
    operation_id="getHistory",
    summary="Get session history",
    description="Returns paginated list of all sessions with durations, pause counts, and completion ratio. Supports filtering by status.",
)
def history(
    limit: int = 20,
    offset: int = 0,
    status: str = None,
    db: DBSession = Depends(get_db)
):
    return crud.get_history(db, limit=limit, offset=offset, status_filter=status)

@router.get(
    "/{session_id}",
    response_model=SessionOut,
    operation_id="getSession",
    summary="Get a single session",
    description="Returns full details of a session by ID.",
)
def get_one(session_id: int, db: DBSession = Depends(get_db)):
    s = crud.get_session(db, session_id)
    if not s:
        _raise("Session not found", 404)
    return s

@router.patch(
    "/{session_id}/start",
    response_model=SessionOut,
    operation_id="startSession",
    summary="Start a scheduled session",
    description="Transitions session from scheduled to active and records the start time.",
)
def start(session_id: int, db: DBSession = Depends(get_db)):
    s, err = crud.start_session(db, session_id)
    if err:
        _raise(err)
    return s

@router.patch(
    "/{session_id}/pause",
    response_model=SessionOut,
    operation_id="pauseSession",
    summary="Pause an active session",
    description="Pauses the session and logs the interruption reason. After 3 pauses, session is marked as interrupted.",
)
def pause(session_id: int, body: PauseRequest, db: DBSession = Depends(get_db)):
    s, err = crud.pause_session(db, session_id, body.reason)
    if err:
        _raise(err)
    return s

@router.patch(
    "/{session_id}/resume",
    response_model=SessionOut,
    operation_id="resumeSession",
    summary="Resume a paused session",
    description="Transitions session from paused back to active.",
)
def resume(session_id: int, db: DBSession = Depends(get_db)):
    s, err = crud.resume_session(db, session_id)
    if err:
        _raise(err)
    return s

@router.patch(
    "/{session_id}/complete",
    response_model=SessionOut,
    operation_id="completeSession",
    summary="Complete a session",
    description="Marks session as completed. If completed while paused it becomes abandoned. If actual time exceeds 110% of scheduled it becomes overdue.",
)
def complete(session_id: int, db: DBSession = Depends(get_db)):
    s, err = crud.complete_session(db, session_id)
    if err:
        _raise(err)
    return s