import { useEffect, useState } from "react";
import { fetchShahiSnanList, fetchShahiSnanPlan } from "../api";
import { Ghat } from "../types";

interface SnanDate {
  id: string;
  date: string;
  name: string;
  significance: string;
  expected_surge: number;
  peak_hours: number[];
  recommended_slots: string[];
}

interface RouteOption {
  ghat: string;
  ghat_id: string;
  distance_km: number;
  steps: number;
}

interface Plan {
  snan: SnanDate;
  arrival_point: string;
  ghats_to_avoid: string[];
  safest_ghats: string[];
  routes: RouteOption[];
  tip: string;
}

interface Props {
  ghats: Ghat[];
}

const ARRIVAL_POINTS = [
  { id: "ujjain_station", name: "Ujjain Railway Station" },
  { id: "nanakheda_bus", name: "Nanakheda Bus Stand" },
  { id: "sector7_camp", name: "Sector 7 Mela Camp" },
];

const surgeColor = (surge: number) => {
  if (surge >= 90) return "text-red-600 bg-red-50 border-red-200";
  if (surge >= 75) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-yellow-600 bg-yellow-50 border-yellow-200";
};

const ShahiSnan = ({}: Props) => {
  const [dates, setDates] = useState<SnanDate[]>([]);
  const [selectedSnan, setSelectedSnan] = useState("");
  const [arrivalPoint, setArrivalPoint] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchShahiSnanList().then(setDates);
  }, []);

  const handlePlan = async () => {
    if (!selectedSnan || !arrivalPoint) {
      setError("Please select both a Shahi Snan date and your arrival point");
      return;
    }
    setLoading(true);
    setError("");
    setPlan(null);
    try {
      const result = await fetchShahiSnanPlan(selectedSnan, arrivalPoint);
      if (result.error) { setError(result.error); return; }
      setPlan(result);
    } catch {
      setError("Could not generate plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-4 max-w-xl mx-auto">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🪔</div>
        <h2 className="text-saffron font-bold text-xl">Shahi Snan Planner</h2>
        <p className="text-gray-400 text-sm mt-1">Plan your sacred bath at Simhastha 2028 safely</p>
      </div>

      {/* Date Cards */}
      <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">Select Your Snan Date</p>
      <div className="space-y-2 mb-4">
        {dates.map((d) => (
          <div
            key={d.id}
            onClick={() => setSelectedSnan(d.id)}
            className={`rounded-xl border p-3 cursor-pointer transition-all ${
              selectedSnan === d.id
                ? "border-saffron bg-saffronLight shadow-sm"
                : "border-gray-100 bg-white hover:border-saffron/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-bold text-sm ${selectedSnan === d.id ? "text-saffron" : "text-gray-800"}`}>
                  {d.name}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${surgeColor(d.expected_surge)}`}>
                {d.expected_surge}% surge
              </span>
            </div>
            {selectedSnan === d.id && (
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">{d.significance}</p>
            )}
          </div>
        ))}
      </div>

      {/* Arrival Point */}
      <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">Your Arrival Point</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {ARRIVAL_POINTS.map((a) => (
          <div
            key={a.id}
            onClick={() => setArrivalPoint(a.id)}
            className={`rounded-xl border p-2 text-center cursor-pointer transition-all ${
              arrivalPoint === a.id
                ? "border-saffron bg-saffronLight"
                : "border-gray-100 bg-white hover:border-saffron/40"
            }`}
          >
            <p className="text-lg mb-1">
              {a.id === "ujjain_station" ? "🚂" : a.id === "nanakheda_bus" ? "🚌" : "⛺"}
            </p>
            <p className={`text-xs font-semibold leading-tight ${arrivalPoint === a.id ? "text-saffron" : "text-gray-600"}`}>
              {a.name}
            </p>
          </div>
        ))}
      </div>

      {/* Plan Button */}
      <button
        onClick={handlePlan}
        disabled={loading}
        className="w-full bg-saffron hover:bg-saffronSoft text-white font-bold py-3 rounded-xl text-sm shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-2"
      >
        {loading ? (
          <><span className="animate-spin">🔄</span> Planning your darshan...</>
        ) : (
          <>🪔 Plan My Shahi Snan</>
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Plan Result */}
      {plan && (
        <div className="mt-4 space-y-3">

          {/* Tip Banner */}
          <div className="bg-saffron rounded-xl p-4 text-white">
            <p className="font-bold text-sm mb-1">🕐 Best Time for Darshan</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {plan.snan.recommended_slots.map((slot) => (
                <span key={slot} className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {slot}
                </span>
              ))}
            </div>
            <p className="text-orange-100 text-xs mt-2 leading-relaxed">{plan.tip}</p>
          </div>

          {/* Safe Routes */}
          <div className="bg-white rounded-xl border border-green-200 p-3">
            <p className="text-sageDark font-bold text-sm mb-2">✅ Recommended Ghats from {plan.arrival_point}</p>
            <div className="space-y-2">
              {plan.routes.map((r, i) => (
                <div key={i} className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-gray-800 text-sm font-semibold">{r.ghat}</p>
                    <p className="text-gray-400 text-xs">{r.steps} stops · {r.distance_km} km</p>
                  </div>
                  <span className="text-sageDark text-xs font-bold bg-green-100 px-2 py-1 rounded-full">
                    Safe Route
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid */}
          <div className="bg-white rounded-xl border border-red-200 p-3">
            <p className="text-red-600 font-bold text-sm mb-2">🚫 Avoid These Ghats on This Date</p>
            <div className="flex flex-wrap gap-2">
              {plan.ghats_to_avoid.map((g) => (
                <span key={g} className="bg-red-50 text-red-500 text-xs font-semibold px-3 py-1 rounded-full border border-red-200">
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-white rounded-xl border border-orange-200 p-3">
            <p className="text-orange-600 font-bold text-sm mb-2">⚡ Peak Surge Hours — Stay Away</p>
            <div className="flex flex-wrap gap-2">
              {plan.snan.peak_hours.map((h) => (
                <span key={h} className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                  {h}:00 AM
                </span>
              ))}
            </div>
          </div>

          <div className="bg-saffronLight border border-saffron/20 rounded-xl p-3 text-center">
            <p className="text-saffron text-sm font-bold">🙏 Jai Mahakal · Safe Darshan</p>
            <p className="text-gray-400 text-xs mt-0.5">Plan generated by KumbhFlow AI</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShahiSnan;