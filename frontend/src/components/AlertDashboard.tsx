import { Ghat } from "../types";

interface Props {
  ghats: Ghat[];
}

const AlertDashboard = ({ ghats }: Props) => {
  const critical = ghats.filter((g) => g.status === "critical");
  const moderate = ghats.filter((g) => g.status === "moderate");
  const safe = ghats.filter((g) => g.status === "safe");

  return (
    <div className="p-3">
      <h2 className="text-lg font-bold text-white mb-3">Alert Dashboard</h2>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-green-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{safe.length}</p>
          <p className="text-green-300 text-xs mt-1">Safe</p>
        </div>
        <div className="bg-yellow-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">{moderate.length}</p>
          <p className="text-yellow-300 text-xs mt-1">Moderate</p>
        </div>
        <div className="bg-red-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{critical.length}</p>
          <p className="text-red-300 text-xs mt-1">Critical</p>
        </div>
      </div>

      {critical.length > 0 && (
        <div className="mb-3">
          <p className="text-red-400 text-sm font-bold mb-2">🚨 Critical Zones</p>
          {critical.map((g) => (
            <div key={g.id} className="bg-red-950 border border-red-800 rounded px-3 py-2 mb-1">
              <p className="text-white text-sm font-medium">{g.name}</p>
              <p className="text-red-400 text-xs">{g.current_density}% capacity — avoid immediately</p>
            </div>
          ))}
        </div>
      )}

      {moderate.length > 0 && (
        <div className="mb-3">
          <p className="text-yellow-400 text-sm font-bold mb-2">⚠️ Moderate Zones</p>
          {moderate.map((g) => (
            <div key={g.id} className="bg-yellow-950 border border-yellow-800 rounded px-3 py-2 mb-1">
              <p className="text-white text-sm font-medium">{g.name}</p>
              <p className="text-yellow-400 text-xs">{g.current_density}% capacity — proceed with caution</p>
            </div>
          ))}
        </div>
      )}

      {safe.length > 0 && (
        <div>
          <p className="text-green-400 text-sm font-bold mb-2">✅ Safe Zones</p>
          {safe.map((g) => (
            <div key={g.id} className="bg-green-950 border border-green-800 rounded px-3 py-2 mb-1">
              <p className="text-white text-sm font-medium">{g.name}</p>
              <p className="text-green-400 text-xs">{g.current_density}% capacity — clear to visit</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertDashboard;