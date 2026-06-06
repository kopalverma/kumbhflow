import axios from "axios";
import { Ghat, Forecast, Route } from "./types";

const BASE = "http://localhost:8000";

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
  return res.data.response;
};