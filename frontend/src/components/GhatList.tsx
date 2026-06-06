import { Ghat } from "../types";

interface Props {
  ghats: Ghat[];
  onSelect: (ghat: Ghat) => void;
  selected: Ghat | null;
}

const statusColor = (status: string) => {
  if (status === "safe") return "bg-green-500";
  if (status === "moderate") return "bg-yellow-500";
  return "bg-red-500";
};

const GhatList = ({ ghats, onSelect, selected }: Props) => {
  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-lg font-bold text-white mb-3 px-2">Live Status</h2>
      {ghats.map((g) => (
        <div
          key={g.id}
          onClick={() => onSelect(g)}
          className={`flex items-center justify-between px-3 py-2 mb-1 rounded cursor-pointer transition-all
            ${selected?.id === g.id ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700"}`}
        >
          <div>
            <p className="text-white text-sm font-medium">{g.name}</p>
            <p className="text-gray-400 text-xs">{g.current_density}% full</p>
          </div>
          <span className={`w-3 h-3 rounded-full ${statusColor(g.status)}`} />
        </div>
      ))}
    </div>
  );
};

export default GhatList;