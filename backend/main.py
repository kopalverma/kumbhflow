from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from crowd_data import get_current_density, get_forecast , get_stampede_risk
from route_engine import get_safe_route
from agent import ask_agent
import os

app = FastAPI(title="KumbhFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class RouteRequest(BaseModel):
    from_id: str
    to_id: str

class ChatRequest(BaseModel):
    message: str

@app.get("/api/ghats")
def ghats():
    return get_current_density()

@app.get("/api/forecast/{ghat_id}")
def forecast(ghat_id: str):
    result = get_forecast(ghat_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Ghat not found")
    return result

@app.get("/api/risk")
def risk():
    return get_stampede_risk()

@app.post("/api/route")
def route(req: RouteRequest):
    result = get_safe_route(req.from_id, req.to_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Route not found")
    return result

@app.post("/api/chat")
async def chat(req: ChatRequest):
    response = ask_agent(req.message)
    return {"response": response}

frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")