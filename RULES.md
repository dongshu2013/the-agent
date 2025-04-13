# AI Agent Backend Rules & Architecture

## Project Overview
- Name: AI Companion
- Version: 0.1.0
- Description: An AI companion agent using OpenRouter, served via REST API

## Tech Stack
- Python 3.11+
- FastAPI for REST API
- PostgreSQL for database
- Poetry for dependency management
- OpenRouter API for LLM integration
- SQLAlchemy for ORM

## Core Components

### 1. API Layer
- FastAPI application with CORS enabled
- Periodic tasks support via lifespan management
- Routes defined in `api/routes.py`

### 2. Database Schema
- **Users**: Stores user information
  - Basic user details (id, username, avatar)
  - Balance tracking
  - Activity timestamps
- **Agents**: AI agent definitions
  - Name and description
  - System prompts
  - Persona enablement flag
- **Messages**: Conversation history
  - Links users and agents
  - Stores both user and assistant messages
  - Timestamps for conversation tracking
- **User Personas**: Dynamic persona management
  - Version control for personas
  - Tracks message processing
  - Links to users and agents

### 3. Core Services
- **OpenRouter Integration**: Custom client for LLM interaction
- **Persona Builder**: Periodic task (6-hour intervals) for updating user personas
- **Configuration Management**: Environment-based settings via pydantic

## Key Settings
- Model: deepseek/deepseek-chat
- Message Constraints:
  - Max Length: 2000 characters
  - Min Length: 1 character
  - Context Window: 50 messages
  - Minimum Messages for Processing: 10

## Environment Requirements
Required environment variables:
- OPENROUTER_API_KEY
- OPENROUTER_API_URL
- DATABASE_URL
- FISH_AUDIO_API_KEY
- API_SECRET_KEY

## Development Tools
- Black for code formatting
- isort for import sorting
- flake8 for linting
- mypy for type checking
- pre-commit hooks for code quality

## Available Scripts
- `start`: Launch production server
- `start-dev`: Launch development server
- `start-chat`: Interactive chat testing
- `add-agent`: Agent management utility
