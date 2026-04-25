"""
Deep Work Session Tracker - SDK Usage Example
Demonstrates full session lifecycle using the generated Python SDK.

Requirements:
- Backend running at http://localhost:8000
- SDK generated in ./deepwork_sdk

Run:
    python sdk_example.py
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "deepwork_sdk"))

from openapi_client import ApiClient, Configuration
from openapi_client.api.sessions_api import SessionsApi
from openapi_client.models.session_create import SessionCreate
from openapi_client.models.pause_request import PauseRequest


def separator(title):
    print(f"\n{'─' * 50}")
    print(f"  {title}")
    print("─" * 50)


def main():
    config = Configuration(host="http://localhost:8000")

    with ApiClient(config) as client:
        api = SessionsApi(client)

        separator("1. CREATE SESSION")
        session = api.create_session(
            SessionCreate(
                title="SDK Demo Session",
                goal="Prove the SDK works end-to-end",
                scheduled_duration=30
            )
        )

        print(f"  ID       : {session.id}")
        print(f"  Title    : {session.title}")
        print(f"  Goal     : {session.goal}")
        print(f"  Duration : {session.scheduled_duration} min")
        print(f"  Status   : {session.status}")

        sid = session.id

        separator("2. START SESSION")
        session = api.start_session(sid)
        print(f"  Status   : {session.status}")
        print(f"  Start    : {session.start_time}")

        separator("3. PAUSE SESSION")
        session = api.pause_session(
            sid,
            PauseRequest(reason="Quick water break")
        )
        print(f"  Status   : {session.status}")

        separator("4. RESUME SESSION")
        session = api.resume_session(sid)
        print(f"  Status   : {session.status}")

        separator("5. COMPLETE SESSION")
        session = api.complete_session(sid)
        print(f"  Status   : {session.status}")
        print(f"  End time : {session.end_time}")

        separator("6. SESSION HISTORY (last 5)")
        history = api.get_history()

        for h in history[:5]:
            print(f"  [{h.id}] {h.title:<30} status={h.status:<12} pauses={h.pause_count}")

        separator("SDK EXAMPLE COMPLETE")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        print("  Make sure backend is running: uvicorn main:app --reload")
        sys.exit(1)