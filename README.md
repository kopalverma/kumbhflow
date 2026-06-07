# KumbhFlow 🕉️
### AI-Powered Crowd Intelligence for Simhastha Mahakumbh 2028, Ujjain

**Live Demo:** https://kopalverma24-kumbhflow.hf.space

---

## The Problem

Simhastha Mahakumbh 2028 in Ujjain is expected to draw over 10 crore pilgrims in 45 days. In 2016, the last Simhastha, crowd surges during Shahi Snan days caused dangerous congestion at Ram Ghat and Mahakaleshwar Temple with zero real-time warning for pilgrims or authorities.

## The Solution

KumbhFlow is a full-stack AI crowd intelligence platform giving pilgrims and authorities real-time visibility into crowd conditions across 15 Ujjain ghat locations on the Shipra River.

---

## Features

**For Pilgrims**
- Live crowd heatmap — green, yellow, red density indicators across 15 ghats
- AI-powered safe route finder using modified Dijkstra's algorithm with live congestion penalties
- Natural language AI Guide powered by LangGraph + Gemini 2.5 Flash
- Snan Planner combining crowd forecasts with Shahi Snan calendar

**For Authorities**
- Real-time alert dashboard for all critical zones
- Stampede Risk Index with calculated danger scores per zone
- Live crowd status updated every 30 seconds

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| AI Agent | LangGraph ReAct Agent, Gemini 2.5 Flash |
| Routing | NetworkX, Dijkstra's Algorithm, Haversine Formula |
| Frontend | React, TypeScript, Tailwind CSS, Leaflet.js |
| Deployment | Docker, Hugging Face Spaces |

---

## Architecture

- **Data Layer** — 15 Ujjain ghat locations with real GPS coordinates and hourly crowd density modeled on Simhastha 2016 historical patterns
- **Backend** — FastAPI with 4 endpoints: live crowd data, 6-hour forecast, safe route, AI chat
- **AI Layer** — LangGraph ReAct agent with 3 live tools: crowd checker, route finder, full status overview
- **Frontend** — React TypeScript with Leaflet.js, dual Pilgrim/Authority view, real-time updates

---

## Local Setup

```bash
git clone https://github.com/kopalverma24/kumbhflow.git
cd kumbhflow

cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
echo GOOGLE_API_KEY=your_key_here > .env
uvicorn main:app --reload

cd ../frontend
npm install
npm run dev
```

---

## Data Note

Crowd density is simulated based on Simhastha 2016 historical patterns and Google Popular Times data for each ghat. In production, the JSON feed is replaced with live IoT sensor API calls — the architecture supports this in a single endpoint change.

---

## Built By

Kopal Verma — B.Tech CSE, VIT Bhopal (2023–27)
Built for Mahakumbh Innovation Hackathon 2028 — Round 2