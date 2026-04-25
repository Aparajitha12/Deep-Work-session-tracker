from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import ResponseValidationError
from database import engine
import models
import logging
from logger import configure_logging
from pydantic import BaseModel
from routers import sessions

class ErrorResponse(BaseModel):
    detail: str


configure_logging()
logger = logging.getLogger(__name__)


models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Deep Work Session Tracker",
    description="API for managing focused deep work sessions with interruption tracking.",
    version="1.0.0",
    contact={"name": "Deep Work API"},
    servers=[{"url": "http://localhost:8000", "description": "Local"}],
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content=ErrorResponse(detail="Resource not found").model_dump()
    )

@app.exception_handler(500)
async def server_error(request: Request, exc):
    logger.error(f"Internal error: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(detail="Internal server error").model_dump()
    )

@app.exception_handler(ResponseValidationError)
async def response_validation_error(request: Request, exc: ResponseValidationError):
    logger.error(f"Response validation error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "version": "1.0.0"}

app.include_router(sessions.router)



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)