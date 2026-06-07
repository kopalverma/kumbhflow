import { useEffect, useState } from "react";
import { fetchRisk } from "../api";

interface GhatRisk {
  id: string;
  name: string;
  risk_score: number;
  level: string;
  label: string;
  density: number;
  bottleneck_score: number;
  is_peak_hour: boolean;
}

interface RiskData {
  overall_risk: number;
  is_peak_hour: boolean;
  current_hour: number;
  ghats: GhatRisk[];
}

const getRingColor = (score: number) => {
  if (score >= 80) return "#ef4444";
  if (score >= 60) return "#f97316";
  if (score >= 30) return "#eab308";
  return "#7daa7d";
};

const getLevelStyle = (level: string) => {
  if (level === "critical") return { bg: "bg-red-50 border-red-200", text: "text-red-600", bar: "bg-red-400" };
  if (level === "high") return { bg: "bg-orange-50 border-orange-200", text: "text-orange-600", bar: "bg-orange-400" };
  if (level === "moderate") return { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-600", bar: "bg-yellow-400" };
  return { bg: "bg-green-50 border-green-200", text: "text-sageDark", bar: "bg-sage" };
};

const StampedeRisk = () => {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const r = await fetchRisk();
      setData(r);
    } catch {
      console.error("Failed to fetch risk data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400 text-sm">Loading risk data...</p>
    </div>
  );

  if (!data) return null;

  const ringColor = getRingColor(data.overall_risk);
  const circumference = 2 * Math.PI * 54;
  const dash = (data.overall_risk / 100) * circumference;

  return (
    <div className="p-4 max-w-xl mx-auto">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">⚡</div>
        <h2 className="text-saffron font-bold text-xl">Stampede Risk Index</h2>
        <p className="text-gray-400 text-sm mt-1">AI-powered crowd safety scoring · updates every 30s</p>
      </div>

      {/* Overall Risk Dial */}
      <div className="bg-white rounded-2xl border border-saffron/10 shadow-sm p-6 mb-4 text-center">
        <div className="relative inline-flex items-center justify-center mb-3">
          <svg width="130" height="130" className="-rotate-90">
            <circle cx="65" cy="65" r="54" fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="65" cy="65" r="54" fill="none"
              stroke={ringColor} strokeWidth="10"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-4xl font-bold" style={{ color: ringColor }}>{data.overall_risk}</p>
            <p className="text-gray-400 text-xs">/ 100</p>
          </div>
        </div>

        <p className="font-bold text-lg text-gray-800">
          {data.overall_risk >= 80 ? "🚨 Stampede Risk" :
           data.overall_risk >= 60 ? "⚠️ High Risk" :
           data.overall_risk >= 30 ? "🟡 Moderate Risk" : "✅ Low Risk"}
        </p>
        <p className="text-gray-400 text-sm mt-1">Overall crowd safety score across all 15 locations</p>

        {data.is_peak_hour && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <p className="text-red-600 text-xs font-semibold">
              Peak Hour Active · {data.current_hour}:00 — Elevated risk period
            </p>
          </div>
        )}
      </div>

      {/* How it's calculated */}
      <div className="bg-saffronLight border border-saffron/20 rounded-xl p-3 mb-4">
        <p className="text-saffron text-xs font-bold mb-2">How the score is calculated</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>📊 Crowd Density</span><span className="font-semibold">60% weight</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>🔀 Bottleneck Factor</span><span className="font-semibold">25% weight</span>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>🕐 Peak Hour Multiplier</span><span className="font-semibold">15% weight</span>
          </div>
        </div>
      </div>

      {/* Per Ghat Risk */}
      <p className="text-gray-700 font-bold text-sm mb-2">Risk by Location</p>
      <div className="space-y-2">
        {data.ghats.map((g) => {
          const style = getLevelStyle(g.level);
          return (
            <div key={g.id} className={`bg-white border rounded-xl p-3 shadow-sm ${style.bg}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-gray-800 text-sm font-semibold">{g.name}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${style.text}`}>{g.label}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.text} bg-white border ${style.bg}`}>
                    {g.risk_score}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${style.bar}`}
                  style={{ width: `${g.risk_score}%` }}
                />
              </div>
              <div className="flex gap-3 mt-1.5">
                <p className="text-gray-400 text-xs">Density: {g.density}%</p>
                <p className="text-gray-400 text-xs">Bottleneck: {g.bottleneck_score}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StampedeRisk;