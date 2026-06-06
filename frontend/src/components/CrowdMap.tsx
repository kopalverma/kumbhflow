import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Ghat } from "../types";

interface Props {
  ghats: Ghat[];
  onSelect: (ghat: Ghat) => void;
}

const statusColor = (status: string) => {
  if (status === "safe") return "#22c55e";
  if (status === "moderate") return "#eab308";
  return "#ef4444";
};

const CrowdMap = ({ ghats, onSelect }: Props) => {
  return (
    <MapContainer
      center={[23.1765, 75.7885]}
      zoom={14}
      className="w-full h-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {ghats.map((g) => (
        <CircleMarker
          key={g.id}
          center={[g.lat, g.lng]}
          radius={10 + g.current_density / 10}
          pathOptions={{
            color: statusColor(g.status),
            fillColor: statusColor(g.status),
            fillOpacity: 0.7,
          }}
          eventHandlers={{ click: () => onSelect(g) }}
        >
          <Popup>
            <div>
              <p className="font-bold">{g.name}</p>
              <p>Density: {g.current_density}%</p>
              <p>Status: {g.status}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default CrowdMap;