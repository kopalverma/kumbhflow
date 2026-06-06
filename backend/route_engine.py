import networkx as nx
import math
from crowd_data import get_current_density

def haversine(lat1, lng1, lat2, lng2):
    R = 6371
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c

EDGES = [
    ("ram_ghat", "triveni_ghat"),
    ("ram_ghat", "shipra_bridge_north"),
    ("ram_ghat", "mahakaleshwar"),
    ("ram_ghat", "datta_akhara"),
    ("mahakaleshwar", "mahakal_corridor"),
    ("mahakaleshwar", "harsiddhi"),
    ("mahakaleshwar", "gopal_mandir"),
    ("mahakal_corridor", "gopal_mandir"),
    ("mahakal_corridor", "harsiddhi"),
    ("harsiddhi", "gopal_mandir"),
    ("harsiddhi", "kalbhairav"),
    ("triveni_ghat", "shipra_bridge_north"),
    ("triveni_ghat", "datta_akhara"),
    ("shipra_bridge_north", "nanakheda_bus"),
    ("shipra_bridge_north", "ujjain_station"),
    ("shipra_bridge_south", "mangalnath"),
    ("shipra_bridge_south", "gadkalika"),
    ("shipra_bridge_south", "ram_ghat"),
    ("mangalnath", "gadkalika"),
    ("mangalnath", "sector7_camp"),
    ("gadkalika", "sector7_camp"),
    ("nanakheda_bus", "ujjain_station"),
    ("nanakheda_bus", "gopal_mandir"),
    ("ujjain_station", "mahakaleshwar"),
    ("kalbhairav", "datta_akhara"),
    ("kalbhairav", "ram_ghat"),
    ("sector7_camp", "shipra_bridge_south"),
    ("datta_akhara", "shipra_bridge_north"),
]

def build_graph():
    ghats = get_current_density()
    ghat_map = {g["id"]: g for g in ghats}
    G = nx.Graph()
    for ghat in ghats:
        G.add_node(ghat["id"], **ghat)
    for edge in EDGES:
        from_id, to_id = edge
        if from_id not in ghat_map or to_id not in ghat_map:
            continue
        from_ghat = ghat_map[from_id]
        to_ghat = ghat_map[to_id]
        distance = haversine(
            from_ghat["lat"], from_ghat["lng"],
            to_ghat["lat"], to_ghat["lng"]
        )
        avg_density = (from_ghat["current_density"] + to_ghat["current_density"]) / 2
        weight = distance + (avg_density * 0.3)
        G.add_edge(from_id, to_id, weight=weight, distance=distance)
    return G, ghat_map

def get_safe_route(from_id, to_id):
    G, ghat_map = build_graph()
    if from_id not in G.nodes:
        return {"error": f"Starting ghat '{from_id}' not found"}
    if to_id not in G.nodes:
        return {"error": f"Destination ghat '{to_id}' not found"}
    if not nx.has_path(G, from_id, to_id):
        return {"error": "No path exists between these two ghats"}
    path = nx.shortest_path(G, from_id, to_id, weight="weight")
    route = []
    total_distance = 0
    total_density = 0
    for i, ghat_id in enumerate(path):
        ghat = ghat_map[ghat_id]
        route.append({
            "step": i + 1,
            "id": ghat_id,
            "name": ghat["name"],
            "lat": ghat["lat"],
            "lng": ghat["lng"],
            "density": ghat["current_density"],
            "status": ghat["status"]
        })
        total_density += ghat["current_density"]
        if i < len(path) - 1:
            next_id = path[i + 1]
            total_distance += G[ghat_id][next_id]["distance"]
    return {
        "from": ghat_map[from_id]["name"],
        "to": ghat_map[to_id]["name"],
        "total_steps": len(path),
        "total_distance_km": round(total_distance, 2),
        "average_density": round(total_density / len(path), 1),
        "route": route
    }