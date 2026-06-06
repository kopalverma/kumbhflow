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

const statusConfig = (status: string) => {
  if (status === "safe") return { text: "text-sageDark", bg: "bg-green-50 border-green-200", label: "✅ Safe", bar: "bg-sage" };
  if (status === "moderate") return { text: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "⚠️ Busy", bar: "bg-yellow-400" };
  return { text: "text-red-700", bg: "bg-red-50 border-red-200", label: "🚨 Avoid", bar: "bg-red-400" };
};

const RoutePanel = ({ ghats }: Props) => {
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFind = async () => {
    if (!fromId || !toId) { setError("Please select both start and destination"); return; }
    if (fromId === toId) { setError("Please pick two different locations"); return; }
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
      setError("Could not find a route. Please try different locations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🛕</div>
        <h2 className="text-saffron font-bold text-xl">Safe Route Finder</h2>
        <p className="text-gray-400 text-sm mt-1">We'll guide you through the least crowded path</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-saffron/10 p-4 mb-4">
        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1 block">Starting From</label>
        <select
          value={fromId}
          onChange={(e) => setFromId(e.target.value)}
          className="w-full bg-saffronLight text-gray-700 rounded-xl px-3 py-2.5 mb-4 text-sm border border-saffron/20 outline-none focus:border-saffron"
        >
          <option value="">Select your starting location</option>
          {ghats.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <label className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1 block">Going To</label>
        <select
          value={toId}
          onChange={(e) => setToId(e.target.value)}
          className="w-full bg-saffronLight text-gray-700 rounded-xl px-3 py-2.5 mb-4 text-sm border border-saffron/20 outline-none focus:border-saffron"
        >
          <option value="">Select your destination</option>
          {ghats.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <button
          onClick={handleFind}
          disabled={loading}
          className="w-full bg-saffron hover:bg-saffronSoft text-white font-bold py-3 rounded-xl text-sm shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">🔄</span> Finding safest path...
            </>
          ) : (
            <>🗺️ Find Safe Route</>
          )}
        </button>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Route Result */}
      {route && (
        <div>
          {/* Summary Card */}
          <div className="bg-saffron rounded-2xl p-4 mb-4 text-white shadow">
            <p className="font-bold text-base">{route.from} → {route.to}</p>
            <div className="flex gap-4 mt-2">
              <div className="text-center">
                <p className="text-2xl font-bold">{route.total_steps}</p>
                <p className="text-orange-200 text-xs">Stops</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{route.total_distance_km}</p>
                <p className="text-orange-200 text-xs">Kilometres</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{route.average_density}%</p>
                <p className="text-orange-200 text-xs">Avg Crowd</p>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {route.route.map((step, i) => {
              const cfg = statusConfig(step.status);
              return (
                <div key={step.step} className={`bg-white rounded-xl border p-3 shadow-sm ${cfg.bg}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-saffron text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm font-semibold">{step.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full mr-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cfg.bar}`}
                            style={{ width: `${step.density}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
                      </div>
                    </div>
                  </div>
                  {i < route.route.length - 1 && (
                    <div className="ml-3.5 mt-1 text-gray-300 text-xs">↓</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-sageDark text-sm font-semibold">🙏 Safe travels · Har Har Mahadev</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePanel;