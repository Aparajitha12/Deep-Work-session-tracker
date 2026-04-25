# Project Structure
```
Deep_Work/
│
├── backend/
│   ├── routers/
│   │   ├── sessions.py
│   │
│   ├── tests/
│   │   ├── test_integration.py
│   │   ├── test_sessions.py
│   │
│   ├── alembic/
│   ├── crud.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── main.py
│   ├── scheduler.py
│   ├── deepwork.db
│   ├── test_deepwork.db
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── sessions.js
│   │   │
│   │   ├── components/
│   │   │   ├── SessionForm.jsx
│   │   │   ├── SessionCard.jsx
│   │   │   ├── History.jsx
│   │   │   ├── LiveChart.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.js
│   │
│   ├── public/
│   ├── package.json
│   └── node_modules/
│
├── deepwork_sdk/
├── env/
├── activity.log
├── README.md
├── openapitools.json
├── runapplication.bat
├── setupdev.bat
```
---

## Key Modules

### Backend
- main.py -> FastAPI entry point  
- crud.py -> Business logic layer  
- models.py -> Database schema  
- schemas.py -> Data validation  
- database.py -> Database connection  
- routers/ -> API endpoints  
- scheduler.py -> Background processing  

### Frontend
- App.jsx -> Main UI container  
- components/ -> UI components  
- api/ -> API integration  

### Others
- deepwork.db -> SQLite database  
- activity.log -> Runtime logs  