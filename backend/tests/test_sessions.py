import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.database import Base, get_db
from main import app

TEST_DB_URL = "sqlite:///./test_deepwork.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

def make_session(**kwargs):
    payload = {"title": "Test", "scheduled_duration": 50, **kwargs}
    return client.post("/sessions/", json=payload).json()

def test_create_session():
    r = client.post("/sessions/", json={"title": "Focus", "scheduled_duration": 30})
    assert r.status_code == 201
    assert r.json()["status"] == "scheduled"

def test_create_session_invalid_duration():
    r = client.post("/sessions/", json={"title": "Bad", "scheduled_duration": -1})
    assert r.status_code == 422

def test_start_session():
    s = make_session()
    r = client.patch(f"/sessions/{s['id']}/start")
    assert r.status_code == 200
    assert r.json()["status"] == "active"

def test_cannot_start_active_session():
    s = make_session()
    client.patch(f"/sessions/{s['id']}/start")
    r = client.patch(f"/sessions/{s['id']}/start")
    assert r.status_code == 400

def test_pause_requires_active():
    s = make_session()
    r = client.patch(f"/sessions/{s['id']}/pause", json={"reason": "phone"})
    assert r.status_code == 400

def test_pause_and_resume():
    s = make_session()
    client.patch(f"/sessions/{s['id']}/start")
    r = client.patch(f"/sessions/{s['id']}/pause", json={"reason": "distraction"})
    assert r.json()["status"] == "paused"
    r2 = client.patch(f"/sessions/{s['id']}/resume")
    assert r2.json()["status"] == "active"

def test_interrupted_after_4_pauses():
    s = make_session()
    client.patch(f"/sessions/{s['id']}/start")
    for i in range(3):
        client.patch(f"/sessions/{s['id']}/pause", json={"reason": f"p{i}"})
        client.patch(f"/sessions/{s['id']}/resume")
    r = client.patch(f"/sessions/{s['id']}/pause", json={"reason": "4th"})
    assert r.json()["status"] == "interrupted"

def test_complete_session():
    s = make_session()
    client.patch(f"/sessions/{s['id']}/start")
    r = client.patch(f"/sessions/{s['id']}/complete")
    assert r.json()["status"] in ("completed", "overdue")

def test_abandoned_when_completed_while_paused():
    s = make_session()
    client.patch(f"/sessions/{s['id']}/start")
    client.patch(f"/sessions/{s['id']}/pause", json={"reason": "gone"})
    r = client.patch(f"/sessions/{s['id']}/complete")
    assert r.json()["status"] == "abandoned"

def test_history_returns_list():
    make_session(title="A")
    make_session(title="B")
    r = client.get("/sessions/history")
    assert r.status_code == 200
    assert len(r.json()) >= 2

def test_get_single_session():
    s = make_session()
    r = client.get(f"/sessions/{s['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == s["id"]

def test_get_nonexistent_session():
    r = client.get("/sessions/99999")
    assert r.status_code == 404

def test_health_endpoint():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_full_lifecycle():
    
    r = client.post("/sessions/", json={"title": "Lifecycle", "scheduled_duration": 50, "goal": "End-to-end"})
    assert r.status_code == 201
    sid = r.json()["id"]
    
    r = client.patch(f"/sessions/{sid}/start")
    assert r.json()["status"] == "active"
    
    r = client.patch(f"/sessions/{sid}/pause", json={"reason": "quick break"})
    assert r.json()["status"] == "paused"
    
    r = client.patch(f"/sessions/{sid}/resume")
    assert r.json()["status"] == "active"
    
    r = client.patch(f"/sessions/{sid}/complete")
    assert r.json()["status"] in ("completed", "overdue")
    assert r.json()["end_time"] is not None
    
    history = client.get("/sessions/history").json()
    match = next((h for h in history if h["id"] == sid), None)
    assert match is not None
    assert match["pause_count"] == 1
