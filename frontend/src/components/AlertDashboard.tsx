import { Ghat } from "../types";

interface Props {
  ghats: Ghat[];
}

const AlertDashboard = ({ ghats }: Props) => {
  const critical = ghats.filter((g) => g.status === "critical");
  const moderate = ghats.filter((g) => g.status === "moderate");
  const safe = ghats.filter((g) => g.status === "safe");
  const total = ghats.length;
  const safePercent = total ? Math.round((safe.length / total) * 100) : 0;

  return (
    <div className="p-4 max-w-xl mx-auto">

      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🔔</div>
        <h2 className="text-saffron font-bold text-xl">Alert Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">Real-time crowd intelligence for authorities</p>
      </div>

      {/* Overall Health Card */}
      <div className="bg-white rounded-2xl border border-saffron/10 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-700 font-semibold text-sm">Overall Crowd Health</p>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            critical.length > 3 ? "bg-red-100 text-red-600" :
            critical.length > 0 ? "bg-yellow-100 text-yellow-700" :
            "bg-green-100 text-sageDark"
          }`}>
            {critical.length > 3 ? "🚨 High Alert" : critical.length > 0 ? "⚠️ Caution" : "✅ Stable"}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-sage rounded-full transition-all"
            style={{ width: `${safePercent}%` }}
          />
        </div>
        <p className="text-gray-400 text-xs">{safePercent}% of locations are currently safe</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-3xl font-bold text-sageDark">{safe.length}</p>
          <p className="text-sage text-xs font-semibold mt-1">✅ Safe</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-3xl font-bold text-yellow-600">{moderate.length}</p>
          <p className="text-yellow-600 text-xs font-semibold mt-1">⚠️ Moderate</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center shadow-sm">
          <p className="text-3xl font-bold text-red-500">{critical.length}</p>
          <p className="text-red-500 text-xs font-semibold mt-1">🚨 Critical</p>
        </div>
      </div>

      {/* Critical Zones */}
      {critical.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <p className="text-red-600 text-sm font-bold">Critical Zones — Immediate Action Required</p>
          </div>
          <div className="space-y-2">
            {critical.map((g) => (
              <div key={g.id} className="bg-red-50 border border-red-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 text-sm font-bold">{g.name}</p>
                  <span className="text-red-500 text-xs font-bold bg-red-100 px-2 py-0.5 rounded-full">
                    {g.current_density}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${g.current_density}%` }} />
                </div>
                <p className="text-red-400 text-xs mt-1.5">⚠️ Deploy crowd control · Divert incoming pilgrims</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Moderate Zones */}
      {moderate.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <p className="text-yellow-700 text-sm font-bold">Moderate Zones — Monitor Closely</p>
          </div>
          <div className="space-y-2">
            {moderate.map((g) => (
              <div key={g.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 text-sm font-bold">{g.name}</p>
                  <span className="text-yellow-700 text-xs font-bold bg-yellow-100 px-2 py-0.5 rounded-full">
                    {g.current_density}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-yellow-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${g.current_density}%` }} />
                </div>
                <p className="text-yellow-600 text-xs mt-1.5">📋 Increase patrol frequency · Prepare diversions</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Zones */}
      {safe.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-sage" />
            <p className="text-sageDark text-sm font-bold">Safe Zones — Operating Normally</p>
          </div>
          <div className="space-y-2">
            {safe.map((g) => (
              <div key={g.id} className="bg-green-50 border border-green-200 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-gray-800 text-sm font-bold">{g.name}</p>
                  <span className="text-sageDark text-xs font-bold bg-green-100 px-2 py-0.5 rounded-full">
                    {g.current_density}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-green-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sage rounded-full" style={{ width: `${g.current_density}%` }} />
                </div>
                <p className="text-sage text-xs mt-1.5">✅ Normal operations · No action needed</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-saffronLight border border-saffron/20 rounded-xl p-3 text-center mt-2">
        <p className="text-saffron text-xs font-semibold">🕉️ KumbhFlow Authority Dashboard</p>
        <p className="text-gray-400 text-xs mt-0.5">Data refreshes every 30 seconds · Simhastha 2028</p>
      </div>
    </div>
  );
};

export default AlertDashboard;