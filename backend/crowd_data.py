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

SHAHI_SNAN_DATES = [
    {
        "id": "snan1",
        "date": "2028-04-14",
        "name": "Meshha Sankranti",
        "significance": "First royal bath — highest footfall of entire Kumbh",
        "expected_surge": 95,
        "peak_hours": [3, 4, 5, 6, 7],
        "recommended_slots": ["03:00–03:45", "07:30–08:30"],
        "ghats_to_avoid": ["ram_ghat", "mahakaleshwar", "triveni_ghat"],
        "safest_ghats": ["mangalnath", "gadkalika", "datta_akhara"]
    },
    {
        "id": "snan2",
        "date": "2028-04-22",
        "name": "Ram Navami",
        "significance": "Birth of Lord Ram — major bathing day",
        "expected_surge": 80,
        "peak_hours": [4, 5, 6, 7, 8],
        "recommended_slots": ["03:30–04:30", "08:00–09:00"],
        "ghats_to_avoid": ["ram_ghat", "mahakal_corridor"],
        "safest_ghats": ["shipra_bridge_north", "sector7_camp", "mangalnath"]
    },
    {
        "id": "snan3",
        "date": "2028-04-29",
        "name": "Hanuman Jayanti",
        "significance": "Birth of Lord Hanuman — large turnout expected",
        "expected_surge": 75,
        "peak_hours": [4, 5, 6, 7],
        "recommended_slots": ["03:00–04:00", "07:00–08:00"],
        "ghats_to_avoid": ["mahakaleshwar", "harsiddhi"],
        "safest_ghats": ["triveni_ghat", "kalbhairav", "gopal_mandir"]
    },
    {
        "id": "snan4",
        "date": "2028-05-11",
        "name": "Mohini Ekadashi",
        "significance": "Ekadashi bathing — spiritually significant",
        "expected_surge": 70,
        "peak_hours": [5, 6, 7, 8],
        "recommended_slots": ["04:30–05:30", "08:30–09:30"],
        "ghats_to_avoid": ["ram_ghat", "triveni_ghat"],
        "safest_ghats": ["mangalnath", "gadkalika", "sector7_camp"]
    },
    {
        "id": "snan5",
        "date": "2028-05-19",
        "name": "Vaisakh Purnima / Buddha Purnima",
        "significance": "Full moon bathing — second largest crowd after Sankranti",
        "expected_surge": 88,
        "peak_hours": [3, 4, 5, 6, 7],
        "recommended_slots": ["02:30–03:30", "07:00–08:00"],
        "ghats_to_avoid": ["ram_ghat", "mahakaleshwar", "mahakal_corridor"],
        "safest_ghats": ["datta_akhara", "shipra_bridge_south", "mangalnath"]
    },
    {
        "id": "snan6",
        "date": "2028-05-27",
        "name": "Shani Jayanti Amavasya",
        "significance": "New moon — final major Shahi Snan of Simhastha",
        "expected_surge": 92,
        "peak_hours": [3, 4, 5, 6],
        "recommended_slots": ["02:00–03:00", "06:30–07:30"],
        "ghats_to_avoid": ["ram_ghat", "triveni_ghat", "mahakaleshwar"],
        "safest_ghats": ["gadkalika", "kalbhairav", "sector7_camp"]
    }
]

def get_shahi_snan_plan(snan_id: str, arrival_point: str):
    snan = next((s for s in SHAHI_SNAN_DATES if s["id"] == snan_id), None)
    if not snan:
        return {"error": "Invalid Shahi Snan date selected"}
    
    all_ghats = get_current_density()
    ghat_map = {g["id"]: g for g in all_ghats}
    
    # Get safe routes from arrival point to each recommended ghat
    from route_engine import get_safe_route
    
    routes = []
    for ghat_id in snan["safest_ghats"]:
        if ghat_id in ghat_map:
            route = get_safe_route(arrival_point, ghat_id)
            if "error" not in route:
                routes.append({
                    "ghat": ghat_map[ghat_id]["name"],
                    "ghat_id": ghat_id,
                    "distance_km": route["total_distance_km"],
                    "steps": len(route["route"])
                })
    
    avoid_names = [ghat_map[g]["name"] for g in snan["ghats_to_avoid"] if g in ghat_map]
    safe_names = [ghat_map[g]["name"] for g in snan["safest_ghats"] if g in ghat_map]
    
    return {
        "snan": {
            "id": snan["id"],
            "date": snan["date"],
            "name": snan["name"],
            "significance": snan["significance"],
            "expected_surge": snan["expected_surge"],
            "peak_hours": snan["peak_hours"],
            "recommended_slots": snan["recommended_slots"],
        },
        "arrival_point": ghat_map.get(arrival_point, {}).get("name", arrival_point),
        "ghats_to_avoid": avoid_names,
        "safest_ghats": safe_names,
        "routes": routes,
        "tip": f"Arrive before {snan['peak_hours'][0]}:00 AM or after {snan['peak_hours'][-1]}:00 AM to avoid peak surge of {snan['expected_surge']}% capacity."
    }

def get_all_shahi_snan():
    return SHAHI_SNAN_DATES