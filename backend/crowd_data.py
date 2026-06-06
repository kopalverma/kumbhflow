import json
import os
from datetime import datetime

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "ghats.json")

def load_ghats():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def get_current_density():
    ghats = load_ghats()
    current_hour = datetime.now().hour
    result = []
    for ghat in ghats:
        result.append({
            "id": ghat["id"],
            "name": ghat["name"],
            "lat": ghat["lat"],
            "lng": ghat["lng"],
            "current_density": ghat["hourly_density"][current_hour],
            "status": get_status(ghat["hourly_density"][current_hour])
        })
    return result

def get_forecast(ghat_id):
    ghats = load_ghats()
    current_hour = datetime.now().hour
    target_ghat = None
    for ghat in ghats:
        if ghat["id"] == ghat_id:
            target_ghat = ghat
            break
    if target_ghat is None:
        return None
    forecast = []
    for i in range(6):
        hour_index = (current_hour + i) % 24
        forecast.append({
            "hour": hour_index,
            "density": target_ghat["hourly_density"][hour_index],
            "status": get_status(target_ghat["hourly_density"][hour_index])
        })
    return {
        "ghat_id": ghat_id,
        "ghat_name": target_ghat["name"],
        "forecast": forecast
    }

def get_status(density):
    if density < 40:
        return "safe"
    elif density < 70:
        return "moderate"
    else:
        return "critical"