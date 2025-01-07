from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from ai_companion.core.openrouter import OpenRouterClient
from ai_companion.tasks.persona_builder import PersonaBuilder


async def schedule_persona_updates(background_tasks: BackgroundTasks, db: Session):
    openrouter_client = OpenRouterClient()
    persona_builder = PersonaBuilder(db, openrouter_client)
    background_tasks.add_task(persona_builder.run_persona_update)
