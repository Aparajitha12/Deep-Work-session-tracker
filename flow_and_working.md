# Flow and Working of the System

## 1. Overview

The system is a Deep Work Session Tracker that enables users to:
- Plan work sessions
- Track progress
- Manage interruptions
- Analyze productivity

---

## 2. Backend Flow

### Request Handling

Frontend -> FastAPI Router -> CRUD Layer -> Database

---

## 3. Session Lifecycle

### Create Session
- Endpoint: POST /sessions/
- Status: scheduled

### Start Session
- Endpoint: PATCH /sessions/{id}/start
- Status: active
- Records start time

### Pause Session
- Endpoint: PATCH /sessions/{id}/pause
- Status: paused or interrupted
- Logs interruption reason

### Resume Session
- Endpoint: PATCH /sessions/{id}/resume
- Status: active

### Complete Session
- Endpoint: PATCH /sessions/{id}/complete
- Final status:
  - completed
  - overdue
  - abandoned

---

## 4. Business Logic

- Session can only be paused when active
- More than 3 pauses -> interrupted
- Completion must be within 110% duration -> otherwise overdue
- Not resumed after pause -> abandoned

---

## 5. Database Design

Tables:
- sessions
- id
- title
- goal
- scheduled_duration
- start_time
- end_time
- status
- created_at
Interruptions:
- id
- session_id
- reason
- pause_time

Relationship:
- One session can have multiple interruptions

---

## 6. Frontend Flow

User Action -> API Call -> Backend Processing -> UI Update

Components:
- SessionForm -> create session
- SessionCard -> active session
- History -> past sessions
- LiveChart -> analytics

---

## 7. Data Processing

- Duration calculated using timestamps
- Completion ratio = actual / scheduled
- Pause count tracked dynamically

---

## 8. Output

- Active session tracking
- Historical session analysis
- Productivity visualization