import axios from "axios";
import { Ghat, Forecast, Route } from "./types";

const BASE = import.meta.env.VITE_API_URL || "";

export const fetchGhats = async (): Promise<Ghat[]> => {
  const res = await axios.get(`${BASE}/api/ghats`);
  return res.data;
};

export const fetchForecast = async (ghatId: string): Promise<Forecast> => {
  const res = await axios.get(`${BASE}/api/forecast/${ghatId}`);
  return res.data;
};

export const fetchRoute = async (fromId: string, toId: string): Promise<Route> => {
  const res = await axios.post(`${BASE}/api/route`, { from_id: fromId, to_id: toId });
  return res.data;
};

export const sendChat = async (message: string): Promise<string> => {
  const res = await axios.post(`${BASE}/api/chat`, { message });
  const data = res.data;
  if (typeof data.response === "string") return data.response;
  if (typeof data.response === "object") return JSON.stringify(data.response);
  return "Sorry, I could not process that response.";
};

export const fetchRisk = async () => {
  const res = await axios.get(`${BASE}/api/risk`);
  return res.data;
};

export const fetchShahiSnanList = async () => {
  const res = await axios.get(`${BASE}/api/shahi-snan`);
  return res.data;
};

export const fetchShahiSnanPlan = async (snanId: string, arrivalPoint: string) => {
  const res = await axios.post(`${BASE}/api/shahi-snan/plan`, {
    snan_id: snanId,
    arrival_point: arrivalPoint,
  });
  return res.data;
};