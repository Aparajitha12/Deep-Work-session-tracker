import sys
import os

# Ensure repo root is on sys.path so `backend` package can be imported during pytest collection
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from fastapi.testclient import TestClient

from main import app
client = TestClient(app)


def test_basic():
    res = client.get("/")
    assert res.status_code in [200, 404]

if __name__ == "__main__":
    test_basic()