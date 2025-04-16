from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from edge_agent.api.routes import router
from edge_agent.core.config import settings
from edge_agent.database import get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    db: Session = next(get_db())
    yield
    db.close()


app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
