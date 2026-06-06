import { useEffect, useState } from "react";
import { fetchGhats } from "./api";
import { Ghat } from "./types";
import CrowdMap from "./components/CrowdMap";
import GhatList from "./components/GhatList";
import RoutePanel from "./components/RoutePanel";
import ChatBot from "./components/ChatBot";
import AlertDashboard from "./components/AlertDashboard";

type Tab = "map" | "route" | "chat" | "alerts";
type Mode = "pilgrim" | "authority";

function App() {
  const [ghats, setGhats] = useState<Ghat[]>([]);
  const [selected, setSelected] = useState<Ghat | null>(null);
  const [tab, setTab] = useState<Tab>("map");
  const [mode, setMode] = useState<Mode>("pilgrim");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadGhats = async () => {
    try {
      const data = await fetchGhats();
      setGhats(data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      console.error("Failed to fetch ghats");
    }
  };

  useEffect(() => {
    loadGhats();
    const interval = setInterval(loadGhats, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "map", label: "Live Map" },
    { id: "route", label: "Safe Route" },
    { id: "chat", label: "AI Assistant" },
    { id: "alerts", label: "Alerts" },
  ];

  return (
    <div className="h-screen bg-gray-900 flex flex-col">

      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-lg">🕉️ KumbhFlow</h1>
          <p className="text-gray-400 text-xs">Simhastha Mahakumbh 2028 · Ujjain</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs">Updated {lastUpdated}</span>
          <button
            onClick={() => setMode(mode === "pilgrim" ? "authority" : "pilgrim")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              mode === "authority"
                ? "bg-blue-600 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            {mode === "pilgrim" ? "🙏 Pilgrim" : "🔒 Authority"}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-gray-800 border-b border-gray-700 flex">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-sm font-medium transition-all ${
              tab === t.id
                ? "text-orange-400 border-b-2 border-orange-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar — GhatList */}
        <div className="w-56 bg-gray-900 border-r border-gray-700 overflow-hidden">
          <GhatList ghats={ghats} onSelect={setSelected} selected={selected} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {tab === "map" && (
            <div className="h-full">
              <CrowdMap ghats={ghats} onSelect={setSelected} />
            </div>
          )}
          {tab === "route" && (
            <div className="h-full overflow-y-auto">
              <RoutePanel ghats={ghats} />
            </div>
          )}
          {tab === "chat" && (
            <div className="h-full">
              <ChatBot />
            </div>
          )}
          {tab === "alerts" && (
            <div className="h-full overflow-y-auto">
              {mode === "authority"
                ? <AlertDashboard ghats={ghats} />
                : (
                  <div className="p-6 text-center text-gray-400">
                    <p className="text-4xl mb-3">🔒</p>
                    <p className="text-white font-bold mb-1">Authority Mode Required</p>
                    <p className="text-sm">Switch to Authority mode using the button in the header to access the alert dashboard.</p>
                  </div>
                )
              }
            </div>
          )}
        </div>
      </div>

      {/* Selected Ghat Bar */}
      {selected && (
        <div className={`px-4 py-2 flex items-center justify-between border-t border-gray-700 ${
          selected.status === "critical" ? "bg-red-950" :
          selected.status === "moderate" ? "bg-yellow-950" : "bg-green-950"
        }`}>
          <div>
            <span className="text-white text-sm font-bold">{selected.name}</span>
            <span className="text-gray-400 text-xs ml-2">{selected.current_density}% capacity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              selected.status === "critical" ? "bg-red-500 text-white" :
              selected.status === "moderate" ? "bg-yellow-500 text-black" : "bg-green-500 text-black"
            }`}>
              {selected.status.toUpperCase()}
            </span>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-lg">×</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;