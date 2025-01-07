from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from ai_companion.api.routes import router
from ai_companion.core.config import settings
from ai_companion.core.openrouter import OpenRouterClient
from ai_companion.database import get_db
from ai_companion.tasks.persona_builder import PersonaBuilder

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create scheduler and persona builder
    db: Session = next(get_db())
    openrouter_client = OpenRouterClient()
    persona_builder = PersonaBuilder(db, openrouter_client)

    # Schedule persona updates every 6 hours
    scheduler.add_job(
        persona_builder.run_persona_update, "interval", hours=6, id="persona_builder"
    )
    scheduler.start()

    yield

    # Shutdown: clean up resources
    scheduler.shutdown()
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
