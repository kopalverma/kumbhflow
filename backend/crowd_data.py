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
    
def get_stampede_risk():
    from route_engine import EDGES
    import datetime
    
    ghats = get_current_density()
    ghat_map = {g["id"]: g for g in ghats}
    
    # Build neighbour map from edges
    neighbours = {g["id"]: [] for g in ghats}
    for edge in EDGES:
        a, b = edge
        if a in neighbours and b in neighbours:
            neighbours[a].append(b)
            neighbours[b].append(a)
    
    # Peak hours — morning bathing and evening aarti
    current_hour = datetime.datetime.now().hour
    peak_hours = list(range(4, 8)) + list(range(17, 20))
    is_peak = current_hour in peak_hours
    
    results = []
    for ghat in ghats:
        gid = ghat["id"]
        density = ghat["current_density"]
        
        # Factor 1 — density score (0-100)
        density_score = density
        
        # Factor 2 — bottleneck score
        # How many neighbours are also overcrowded
        nb = neighbours.get(gid, [])
        if nb:
            crowded_nb = sum(1 for n in nb if ghat_map[n]["current_density"] > 60)
            bottleneck_score = (crowded_nb / len(nb)) * 100
        else:
            bottleneck_score = 0
        
        # Factor 3 — peak hour multiplier
        peak_score = 100 if is_peak else 0
        
        # Weighted final score
        risk_score = round(
            (density_score * 0.60) +
            (bottleneck_score * 0.25) +
            (peak_score * 0.15)
        )
        risk_score = min(risk_score, 100)
        
        # Risk level
        if risk_score >= 80:
            level = "critical"
            label = "🚨 Stampede Risk"
        elif risk_score >= 60:
            level = "high"
            label = "⚠️ High Risk"
        elif risk_score >= 30:
            level = "moderate"
            label = "🟡 Moderate"
        else:
            level = "low"
            label = "✅ Low Risk"
        
        results.append({
            "id": gid,
            "name": ghat["name"],
            "risk_score": risk_score,
            "level": level,
            "label": label,
            "density": density,
            "bottleneck_score": round(bottleneck_score),
            "is_peak_hour": is_peak,
            "current_hour": current_hour
        })
    
    # Sort by risk score descending
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    
    overall = round(sum(r["risk_score"] for r in results) / len(results))
    
    return {
        "overall_risk": overall,
        "is_peak_hour": is_peak,
        "current_hour": current_hour,
        "ghats": results
    }