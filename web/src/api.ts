// api/src/presentation/plan.controller.ts の形にそのまま対応する、薄いクライアント。
// VITE_API_BASE_URL が無ければ、開発機のAPIを直接見る。
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export type ItineraryStop = {
  location: string;
  arrival: string | null;
  departure: string;
};

export type PlanView = {
  id: string;
  origin: string;
  destination: string;
  desiredArrivalTime: string;
  pickupPoints: { id: string; location: string }[];
  itinerary: ItineraryStop[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} が失敗した: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function createPlan(input: {
  origin: string;
  destination: string;
  desiredArrivalTime: string;
}): Promise<PlanView> {
  return request("/plans", { method: "POST", body: JSON.stringify(input) });
}

export function getPlan(id: string): Promise<PlanView> {
  return request(`/plans/${id}`);
}

export function addPickupPoint(planId: string, location: string): Promise<PlanView> {
  const id = crypto.randomUUID();
  return request(`/plans/${planId}/pickup-points`, {
    method: "POST",
    body: JSON.stringify({ id, location }),
  });
}

export function removePickupPoint(planId: string, pointId: string): Promise<PlanView> {
  return request(`/plans/${planId}/pickup-points/${pointId}`, { method: "DELETE" });
}
