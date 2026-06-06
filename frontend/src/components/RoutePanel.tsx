import { useState } from "react";
import { fetchRoute } from "../api";
import { Ghat } from "../types";

interface RouteStep {
  step: number;
  id: string;
  name: string;
  lat: number;
  lng: number;
  density: number;
  status: string;
}

interface RouteResult {
  from: string;
  to: string;
  total_steps: number;
  total_distance_km: number;
  average_density: number;
  route: RouteStep[];
}

interface Props {
  ghats: Ghat[];
}

const statusColor = (status: string) => {
  if (status === "safe") return "text-green-400";
  if (status === "moderate") return "text-yellow-400";
  return "text-red-400";
};

const statusBg = (status: string) => {
  if (status === "safe") return "border-green-800 bg-green-950";
  if (status === "moderate") return "border-yellow-800 bg-yellow-950";
  return "border-red-800 bg-red-950";
};

const RoutePanel = ({ ghats }: Props) => {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFind = async () => {
    if (!fromId || !toId) { setError("Please select both locations"); return; }
    if (fromId === toId) { setError("Pick two different locations"); return; }
    setLoading(true);
    setError("");
    setRoute(null);
    try {
      const r = await fetchRoute(fromId, toId);
      if ((r as any).error) {
        setError((r as any).error);
      } else {
        setRoute(r as unknown as RouteResult);
      }
    } catch {
      setError("No route found between these locations");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-white mb-4">Safe Route Finder</h2>

      <select
        value={fromId}
        onChange={(e) => setFromId(e.target.value)}
        className="w-full bg-gray-700 text-white rounded px-3 py-2 mb-2 text-sm"
      >
        <option value="">From — select start</option>
        {ghats.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      <select
        value={toId}
        onChange={(e) => setToId(e.target.value)}
        className="w-full bg-gray-700 text-white rounded px-3 py-2 mb-3 text-sm"
      >
        <option value="">To — select destination</option>
        {ghats.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      <button
        onClick={handleFind}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded text-sm disabled:opacity-50 mb-2"
      >
        {loading ? "Finding safe route..." : "Find Safe Route"}
      </button>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      {route && (
        <div className="mt-4">
          <div className="bg-gray-800 rounded-lg p-3 mb-3">
            <p className="text-white text-sm font-bold">{route.from} → {route.to}</p>
            <p className="text-gray-400 text-xs mt-1">
              {route.total_steps} stops · {route.total_distance_km} km · avg density {route.average_density}%
            </p>
          </div>

          {route.route.map((step) => (
            <div key={step.step} className={`flex items-center gap-3 mb-2 border rounded px-3 py-2 ${statusBg(step.status)}`}>
              <span className="text-gray-400 text-xs font-bold w-5">{step.step}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{step.name}</p>
                <p className={`text-xs ${statusColor(step.status)}`}>
                  {step.density}% · {step.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutePanel;