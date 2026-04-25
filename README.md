# Deep Work Session Tracker

A full-stack application to plan, execute, and analyze focused work sessions with interruption tracking and productivity insights.

---

## Overview

This system enables users to:

- Plan structured deep work sessions  
- Track focus time and interruptions  
- Analyze productivity patterns  
- Reflect on work efficiency  

The project follows a clean full-stack architecture using FastAPI, React, SQLAlchemy, Alembic and SQLite.

---

## Documentation

- [Project Structure](STRUCTURE.md)  
- [Flow and Working](FLOW_AND_WORKING.md)  

---

## Features

### Session Lifecycle Management
- Create, start, pause, resume, and complete sessions  
- Tracks session states:
  - scheduled  
  - active  
  - paused  
  - completed  
  - interrupted  
  - abandoned  
  - overdue  

---
## Automation Scripts
### Setup
Sets up the development environment:
- Creates virtual environment
- Installs backend dependencies
- Runs database migrations
- Installs frontend dependencies

Run:
```bash
setupdev.bat
```
## Run application
Runs the full application:
- Starts backend
- Starts frontend

Run:
```bash
runapplication.bat
```
---

### Interruption Tracking
- Logs pause events with reasons  
- Tracks number of interruptions per session  
- More than 3 pauses -> session marked as interrupted 

---

### Productivity Metrics
- Calculates actual duration using timestamps  
- Computes completion ratio  
- Provides historical session summaries  

---

### Visualization
- Displays productivity trends  
- Historical session analytics via charts  

---

## Backend Logic

- A session can only be paused when active  
- More than 3 pauses -> interrupted  
- Completion beyond 110% duration -> overdue  
- Not resumed after pause -> abandoned  

---

## Tech Stack

### Backend
- FastAPI  
- SQLAlchemy  
- SQLite  
- Alembic  

### Frontend
- React.js  
- Axios  

---
## Testing

The backend includes both unit tests and integration tests to ensure correctness of logic and API behavior.

### Unit Testing
Tests individual functions and business logic
Covers session lifecycle rules (pause, resume, complete, etc.)
### Integration Testing
Tests full API flow using FastAPI TestClient
Validates end-to-end session lifecycle

Run all tests:
```bash
pytest -v
```
---
## Error Handling
- Input validation using Pydantic
- Proper HTTP status codes (4xx / 5xx)
- Graceful handling of invalid operations
---

## SDK Usage

The Python SDK is generated using OpenAPI Generator and enables interaction with the API programmatically.

### Example Usage

A complete working example is provided in:

sdk_example.py

Run the example:

```bash
python sdk_example.py
```
---
## Setup Instructions

### Backend Setup

```bash
cd backend
python -m venv env
call env\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
```
---
## Future Work
### Voice-Controlled Sessions
- Start, pause, resume, complete sessions using voice
- Hands-free interaction using speech recognition
### Intelligent Routine Tracker
- Learn user behavior patterns over time
- Suggest optimal session timings
- Identify productivity peaks and trends
### Smart Notifications
- Session reminders
- Alerts for excessive interruptions
### Advanced Analytics
- Weekly/monthly productivity reports
- Personalized recommendations
---
