from asyncio import create_task, sleep
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from ai_companion.api.routes import router
from ai_companion.core.config import settings
from ai_companion.core.openrouter import OpenRouterClient
from ai_companion.database import get_db
from ai_companion.tasks.persona_builder import PersonaBuilder


async def run_periodic_task(persona_builder: PersonaBuilder):
    while True:
        await persona_builder.run_persona_update()
        await sleep(6 * 3600)  # Sleep for 6 hours


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create persona builder
    db: Session = next(get_db())
    openrouter_client = OpenRouterClient()
    persona_builder = PersonaBuilder(db, openrouter_client)

    # Start periodic task
    task = create_task(run_periodic_task(persona_builder))

    yield

    # Shutdown: clean up resources
    task.cancel()
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
