from sqlalchemy.orm import Session as DBSession
from models import Session, Interruption
from schemas import SessionCreate
from datetime import datetime, timezone


def _now():
    return datetime.now(timezone.utc)


def _to_utc(dt):
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def create_session(db: DBSession, data: SessionCreate):
    s = Session(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


def get_session(db: DBSession, session_id: int):
    return db.query(Session).filter(Session.id == session_id).first()


def start_session(db: DBSession, session_id: int):
    s = get_session(db, session_id)
    if not s:
        return None, "Session not found"
    if s.status != "scheduled":
        return None, f"Cannot start session with status '{s.status}'"
    s.status = "active"
    s.start_time = _now()
    db.commit()
    db.refresh(s)
    return s, None


def pause_session(db: DBSession, session_id: int, reason: str):
    s = get_session(db, session_id)
    if not s:
        return None, "Session not found"
    if s.status != "active":
        return None, f"Cannot pause session with status '{s.status}'"
    interruption = Interruption(session_id=session_id, reason=reason, pause_time=_now())
    db.add(interruption)
    db.flush()
    count = db.query(Interruption).filter(Interruption.session_id == session_id).count()
    s.status = "interrupted" if count > 3 else "paused"
    db.commit()
    db.refresh(s)
    return s, None


def resume_session(db: DBSession, session_id: int):
    s = get_session(db, session_id)
    if not s:
        return None, "Session not found"
    if s.status != "paused":
        return None, f"Cannot resume session with status '{s.status}'"
    s.status = "active"
    db.commit()
    db.refresh(s)
    return s, None


def complete_session(db: DBSession, session_id: int):
    s = get_session(db, session_id)
    if not s:
        return None, "Session not found"
    if s.status not in ("active", "paused"):
        return None, f"Cannot complete session with status '{s.status}'"
    now = _now()
    if s.status == "paused":
        s.status = "abandoned"
    else:
        start = _to_utc(s.start_time)
        actual_mins = (now - start).total_seconds() / 60
        allowed = s.scheduled_duration * 1.10
        s.status = "overdue" if actual_mins > allowed else "completed"
    s.end_time = now
    db.commit()
    db.refresh(s)
    return s, None


def get_history(db: DBSession, limit: int = 20, offset: int = 0, status_filter: str = None):
    query = db.query(Session).order_by(Session.created_at.desc())
    if status_filter:
        query = query.filter(Session.status == status_filter)
    sessions = query.offset(offset).limit(limit).all()
    result = []
    for s in sessions:
        count = db.query(Interruption).filter(Interruption.session_id == s.id).count()
        actual = None
        ratio = None
        if s.start_time and s.end_time:
            start = _to_utc(s.start_time)
            end = _to_utc(s.end_time)
            actual = round((end - start).total_seconds() / 60, 2)
            ratio = round(actual / s.scheduled_duration, 2) if s.scheduled_duration else None
        result.append({
            "id": s.id,
            "title": s.title,
            "scheduled_duration": s.scheduled_duration,
            "status": s.status,
            "pause_count": count,
            "actual_duration": actual,
            "completion_ratio": ratio,
        })
    return result