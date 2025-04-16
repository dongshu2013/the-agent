import uvicorn


def start_server():
    uvicorn.run("edge_agent.api.app:app", host="0.0.0.0", port=8000, lifespan="on")


def start_dev():
    uvicorn.run(
        "edge_agent.api.app:app",
        host="0.0.0.0",
        port=8000,
        lifespan="on",
        reload=True,
    )