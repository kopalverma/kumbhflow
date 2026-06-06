import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import create_react_agent
from crowd_data import get_current_density, get_forecast
from route_engine import get_safe_route

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

@tool
def check_crowd(ghat_name: str) -> str:
    """
    Check the current crowd density and forecast for a specific ghat in Ujjain.
    Use this when a pilgrim asks about crowd levels, safety, or best time to visit a ghat.
    Input should be the ghat name or id like 'ram_ghat' or 'mahakaleshwar'.
    """
    all_ghats = get_current_density()
    target = None
    for ghat in all_ghats:
        if (ghat_name.lower() in ghat["name"].lower() or
            ghat_name.lower() in ghat["id"].lower()):
            target = ghat
            break
    if target is None:
        names = [g["name"] for g in all_ghats]
        return f"Ghat not found. Available ghats are: {', '.join(names)}"
    forecast_data = get_forecast(target["id"])
    forecast_text = ""
    for f in forecast_data["forecast"]:
        forecast_text += f"\n  {f['hour']}:00 — density {f['density']}% ({f['status']})"
    return (
        f"Current status of {target['name']}:\n"
        f"Density: {target['current_density']}% — {target['status'].upper()}\n"
        f"\nNext 6 hours forecast:{forecast_text}\n"
        f"\nSafety advice: "
        f"{'Avoid this ghat right now, extremely crowded.' if target['current_density'] > 70 else 'Moderate crowd, proceed with caution.' if target['current_density'] > 40 else 'Safe to visit, relatively less crowded.'}"
    )

@tool
def find_route(from_ghat: str, to_ghat: str) -> str:
    """
    Find the safest route between two ghats in Ujjain avoiding congested areas.
    Use this when a pilgrim asks for directions or the safest way to reach a ghat.
    Input should be ghat ids like 'ujjain_station' and 'ram_ghat'.
    """
    route_data = get_safe_route(from_ghat, to_ghat)
    if "error" in route_data:
        return f"Route error: {route_data['error']}"
    steps_text = ""
    for step in route_data["route"]:
        steps_text += (
            f"\n  Step {step['step']}: {step['name']} "
            f"(density: {step['density']}% — {step['status']})"
        )
    return (
        f"Safest route from {route_data['from']} to {route_data['to']}:\n"
        f"Total distance: {route_data['total_distance_km']} km\n"
        f"Average crowd density: {route_data['average_density']}%\n"
        f"Route steps:{steps_text}"
    )

@tool
def get_all_ghats_status() -> str:
    """
    Get current crowd status of all ghats in Ujjain.
    Use this when a pilgrim asks which ghats are safe, least crowded, or best to visit right now.
    """
    all_ghats = get_current_density()
    safe = [g for g in all_ghats if g["status"] == "safe"]
    moderate = [g for g in all_ghats if g["status"] == "moderate"]
    critical = [g for g in all_ghats if g["status"] == "critical"]
    result = "Current crowd status across all Ujjain ghats:\n"
    if critical:
        result += f"\nCRITICAL (avoid): {', '.join([g['name'] for g in critical])}"
    if moderate:
        result += f"\nMODERATE (caution): {', '.join([g['name'] for g in moderate])}"
    if safe:
        result += f"\nSAFE (good to visit): {', '.join([g['name'] for g in safe])}"
    return result

tools = [check_crowd, find_route, get_all_ghats_status]

agent = create_react_agent(llm, tools)

def ask_agent(question: str) -> str:
    try:
        response = agent.invoke({
            "messages": [HumanMessage(content=(
                f"You are KumbhFlow AI, a helpful assistant for pilgrims visiting "
                f"Simhastha Mahakumbh 2028 in Ujjain. You help pilgrims navigate safely "
                f"by checking crowd levels and finding safe routes to ghats on the Shipra river. "
                f"Always be helpful, specific, and mention actual ghat names and density numbers. "
                f"Answer in simple English. User question: {question}"
            ))]
        })
        messages = response["messages"]
        for message in reversed(messages):
            if hasattr(message, "content") and message.content:
                if not hasattr(message, "tool_calls") or not message.tool_calls:
                    return message.content
        return "I could not process your question. Please try again."
    except Exception as e:
        return f"Agent error: {str(e)}"