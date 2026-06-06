import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Ghat } from "../types";

interface Props {
  ghats: Ghat[];
  onSelect: (ghat: Ghat) => void;
}

const statusConfig = (status: string) => {
  if (status === "safe") return { color: "#7daa7d", fill: "#7daa7d", label: "✅ Safe" };
  if (status === "moderate") return { color: "#eab308", fill: "#eab308", label: "⚠️ Busy" };
  return { color: "#ef4444", fill: "#ef4444", label: "🚨 Avoid" };
};

const CrowdMap = ({ ghats, onSelect }: Props) => {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[23.1765, 75.7885]}
        zoom={14}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {ghats.map((g) => {
          const cfg = statusConfig(g.status);
          return (
            <CircleMarker
              key={g.id}
              center={[g.lat, g.lng]}
              radius={10 + g.current_density / 8}
              pathOptions={{
                color: cfg.color,
                fillColor: cfg.fill,
                fillOpacity: 0.75,
                weight: 2,
              }}
              eventHandlers={{ click: () => onSelect(g) }}
            >
              <Popup>
                <div className="text-center p-1 min-w-32">
                  <p className="font-bold text-gray-800 text-sm">{g.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{g.current_density}% capacity</p>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${g.current_density}%`,
                        backgroundColor: cfg.color
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs font-semibold" style={{ color: cfg.color }}>
                    {cfg.label}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white rounded-xl shadow-md border border-saffron/10 px-3 py-2">
        <p className="text-gray-500 text-xs font-semibold mb-1.5">Crowd Level</p>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sage flex-shrink-0" />
            <span className="text-xs text-gray-600">Safe · below 40%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
            <span className="text-xs text-gray-600">Busy · 40–70%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400 flex-shrink-0" />
            <span className="text-xs text-gray-600">Avoid · above 70%</span>
          </div>
        </div>
      </div>

      {/* Tap hint */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-full shadow px-3 py-1.5 border border-saffron/10">
        <p className="text-gray-500 text-xs">🗺️ Tap any circle for details</p>
      </div>
    </div>
  );
};

export default CrowdMap;