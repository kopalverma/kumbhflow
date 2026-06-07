import { useEffect, useState } from "react";
import { fetchGhats } from "./api";
import { Ghat } from "./types";
import CrowdMap from "./components/CrowdMap";
import GhatList from "./components/GhatList";
import RoutePanel from "./components/RoutePanel";
import ChatBot from "./components/ChatBot";
import AlertDashboard from "./components/AlertDashboard";
import StampedeRisk from "./components/StampedeRisk";

type Tab = "map" | "route" | "chat" | "alerts" | "risk";
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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "map", label: "Live Map", icon: "🗺️" },
    { id: "route", label: "Safe Route", icon: "🛕" },
    { id: "chat", label: "AI Guide", icon: "🙏" },
    { id: "alerts", label: "Alerts", icon: "🔔" },
    { id: "risk", label: "Risk Index", icon: "⚡" },
  ];

  return (
    <div className="h-screen bg-cream flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-white border-b-2 border-saffron/20 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-saffron flex items-center justify-center text-white text-lg shadow">
            🕉️
          </div>
          <div>
            <h1 className="text-saffron font-bold text-xl leading-tight">KumbhFlow</h1>
            <p className="text-roseGold text-xs">Simhastha Mahakumbh 2028 · Ujjain</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="text-center hidden sm:block">
              <p className="text-gray-400 text-xs">Last updated</p>
              <p className="text-gray-600 text-xs font-medium">{lastUpdated}</p>
            </div>
          )}
          <button
            onClick={() => setMode(mode === "pilgrim" ? "authority" : "pilgrim")}
            className={`px-4 py-2 rounded-full text-xs font-semibold shadow transition-all ${
              mode === "authority"
                ? "bg-sageDark text-white"
                : "bg-saffron text-white"
            }`}
          >
            {mode === "pilgrim" ? "🙏 Pilgrim" : "🔒 Authority"}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-saffron/10 flex shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
              tab === t.id
                ? "text-saffron border-b-2 border-saffron bg-saffronLight"
                : "text-gray-400 hover:text-saffronSoft hover:bg-orange-50"
            }`}
          >
            <span className="text-base">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar */}
        <div className="w-52 bg-white border-r border-saffron/10 overflow-hidden shadow-sm">
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
            <div className="h-full overflow-y-auto bg-cream">
              <RoutePanel ghats={ghats} />
            </div>
          )}
          {tab === "chat" && (
            <div className="h-full bg-cream">
              <ChatBot />
            </div>
          )}
          {tab === "alerts" && (
            <div className="h-full overflow-y-auto bg-cream">
              {mode === "authority"
                ? <AlertDashboard ghats={ghats} />
                : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-8">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-roseGold font-bold text-lg mb-2">Authority Access Only</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Switch to Authority mode using the button in the header to view the full alert dashboard.
                    </p>
                  </div>
                )
              }
              
            </div>
          )}
          {tab === "risk" && (
            <div className="h-full overflow-y-auto bg-cream">
              <StampedeRisk />
            </div>
          )}
        </div>
      </div>

      {/* Selected Ghat Bottom Bar */}
      {selected && (
        <div className={`px-4 py-3 flex items-center justify-between border-t-2 shadow-inner ${
          selected.status === "critical"
            ? "bg-red-50 border-red-200"
            : selected.status === "moderate"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-green-50 border-green-200"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {selected.status === "critical" ? "🚨" : selected.status === "moderate" ? "⚠️" : "✅"}
            </span>
            <div>
              <p className="text-gray-800 text-sm font-bold">{selected.name}</p>
              <p className="text-gray-500 text-xs">{selected.current_density}% capacity · {selected.status}</p>
            </div>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="text-gray-400 hover:text-gray-600 text-xl font-light"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;