import { Ghat } from "../types";

interface Props {
  ghats: Ghat[];
  onSelect: (ghat: Ghat) => void;
  selected: Ghat | null;
}

const statusConfig = (status: string) => {
  if (status === "safe") return { dot: "bg-sage", text: "text-sageDark", bg: "bg-green-50", label: "Safe" };
  if (status === "moderate") return { dot: "bg-yellow-400", text: "text-yellow-700", bg: "bg-yellow-50", label: "Busy" };
  return { dot: "bg-red-400", text: "text-red-700", bg: "bg-red-50", label: "Avoid" };
};

const GhatList = ({ ghats, onSelect, selected }: Props) => {
  const critical = ghats.filter((g) => g.status === "critical").length;

  return (
    <div className="h-full flex flex-col">

      {/* Sidebar Header */}
      <div className="px-3 py-3 border-b border-saffron/10 bg-saffronLight">
        <p className="text-saffron font-bold text-sm">🛕 Live Status</p>
        <p className="text-gray-400 text-xs mt-0.5">{ghats.length} locations tracked</p>
        {critical > 0 && (
          <div className="mt-2 bg-red-100 border border-red-200 rounded-lg px-2 py-1">
            <p className="text-red-600 text-xs font-semibold">🚨 {critical} zone{critical > 1 ? "s" : ""} critical</p>
          </div>
        )}
      </div>

      {/* Ghat List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {ghats.map((g) => {
          const cfg = statusConfig(g.status);
          const isSelected = selected?.id === g.id;
          return (
            <div
              key={g.id}
              onClick={() => onSelect(g)}
              className={`rounded-xl px-3 py-2.5 cursor-pointer transition-all border ${
                isSelected
                  ? "border-saffron bg-saffronLight shadow-sm"
                  : `border-transparent ${cfg.bg} hover:border-saffron/30`
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold leading-tight ${isSelected ? "text-saffron" : "text-gray-700"}`}>
                  {g.name}
                </p>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-400 text-xs">{g.current_density}% full</p>
                <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
              </div>

              {/* Density Bar */}
              <div className="mt-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    g.status === "critical" ? "bg-red-400" :
                    g.status === "moderate" ? "bg-yellow-400" : "bg-sage"
                  }`}
                  style={{ width: `${g.current_density}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-saffron/10 bg-white">
        <p className="text-gray-400 text-xs mb-1 font-medium">Legend</p>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sage" />
            <span className="text-xs text-gray-500">Safe · below 40%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs text-gray-500">Busy · 40–70%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-xs text-gray-500">Avoid · above 70%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GhatList;