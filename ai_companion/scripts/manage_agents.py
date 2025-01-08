from sqlalchemy.orm import Session

from ai_companion.database import SessionLocal
from ai_companion.models.agents import Agent


def get_or_create_agent(
    db: Session,
    name: str,
    description: str,
    system_prompt: str,
    enable_persona: bool = False,
) -> Agent:
    """Get an existing agent by name or create a new one."""
    agent = db.query(Agent).filter(Agent.name == name).first()

    if agent:
        # Update existing agent
        agent.description = description
        agent.system_prompt = system_prompt
        agent.enable_persona = enable_persona
        db.commit()
        print(f"Updated existing agent: {name}")
    else:
        # Create new agent
        agent = Agent(
            name=name,
            description=description,
            system_prompt=system_prompt,
            enable_persona=enable_persona,
        )
        db.add(agent)
        db.commit()
        print(f"Created new agent: {name}")

    return agent


def main():
    """Main function to manage agents."""
    db = SessionLocal()

    # Example agents - you can modify these or add more
    agents = [
        {
            "name": "donuts",
            "description": "An agent to learn about you and create your persona",
            # flake8: noqa
            # fmt: off
            "system_prompt": """
You are opinion and interests collector, an AI agent designed to chat with the user in Telegram and encourage them to share their opinions, interests and beliefs.

Instructions:
1. Maintain a friendly, casual, and engaging tone throughout the conversation.
2. You primary goal is to learn their interests and collect their opinions on these topics.
3. You should debate with the user if you don't agree with their opinions, challenge them, but don't be too aggressive.
4. Actively ask open-ended questions to lead the conversation to some other topics if you think you already know enough about the user's opinions on one topic.
5. Don't be too serious or emotional, don't try to help the user or give advice, simply chat with the user.
6. You can try out some questionaires such as MBTI, Big Five Personality Test, etc.

As you converse with the user, focus on gathering information about:
- Their interests, opinions, beliefs and preferences e.t.c
- Their occupation, unique skills or talents

Remember:
1. Don't be too verbose. Keep your responses concise, short and to the point. This is a telegram chat, not a long conversation.
2. Always reply less than 50 words, reply with short messages, less than 10 words, if possible.
3. Let the user speak as much as possible, your goal is to encourage the user to share more and more.
4. Keep the conversation flowing naturally. Don't interrogate the user or make the information-gathering process feel forced.
""",
            # fmt: on
            "enable_persona": True,
        },
    ]

    try:
        for agent_data in agents:
            get_or_create_agent(
                db=db,
                name=agent_data["name"],
                description=agent_data["description"],
                system_prompt=agent_data["system_prompt"],
                enable_persona=agent_data["enable_persona"],
            )
        print("Agent management completed successfully!")

    except Exception as e:
        print(f"Error managing agents: {e}")

    finally:
        db.close()
