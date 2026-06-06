export interface Ghat {
  id: string;
  name: string;
  lat: number;
  lng: number;
  current_density: number;
  status: "safe" | "moderate" | "critical";
}

export interface ForecastHour {
  hour: number;
  density: number;
  status: string;
}

export interface Forecast {
  ghat_id: string;
  forecast: ForecastHour[];
}

export interface RouteStep {
  ghat: string;
  density: number;
  status: string;
}

export interface Route {
  from: string;
  to: string;
  steps: RouteStep[];
  total_distance_km: number;
}