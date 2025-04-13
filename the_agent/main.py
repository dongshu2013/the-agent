import uvicorn


def start_server():
    uvicorn.run("ai_companion.api.app:app", host="0.0.0.0", port=8000, lifespan="on")


def start_dev():
    uvicorn.run(
        "ai_companion.api.app:app",
        host="0.0.0.0",
        port=8000,
        lifespan="on",
        reload=True,
    )
