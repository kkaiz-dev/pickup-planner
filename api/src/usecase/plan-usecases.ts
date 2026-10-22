import { calculateItinerary, changeDestination, changeOrigin, changePickupPoint, createPlan, removePickupPoint, addPickupPoint as addPickupPointToPlan, type Plan } from "../domain/plan";
import type { Location } from "../domain/location";
import type { PickupPoint } from "../domain/pickup-point";
import type { RouteEstimatorPort } from "../domain/route-estimator";
import type { PlanRecord, PlanRepositoryPort } from "./plan-repository";

// event-storming/process-level.md のポリシーをここで実行する。
// 「計画ができたら／地点が変わったら／出発地・目的地が変わったら、計算し直す」。
// 経路見積りポートが非同期のため、ここも非同期。
export type Dependencies = {
  repository: PlanRepositoryPort;
  routeEstimator: RouteEstimatorPort;
  generateId: () => string;
};

export async function createPlanUseCase(
  deps: Dependencies,
  input: { origin: Location; destination: Location; desiredArrivalTime: Plan["desiredArrivalTime"] },
): Promise<PlanRecord> {
  const plan = createPlan(input);
  const itinerary = await calculateItinerary(plan, deps.routeEstimator);
  const record: PlanRecord = { id: deps.generateId(), plan, itinerary };
  deps.repository.save(record);
  return record;
}

export function getPlanUseCase(deps: Dependencies, id: string): PlanRecord | undefined {
  return deps.repository.findById(id);
}

function requireRecord(deps: Dependencies, id: string): PlanRecord {
  const record = deps.repository.findById(id);
  if (!record) {
    throw new Error(`計画が見つからない: ${id}`);
  }
  return record;
}

async function recalculateAndSave(
  deps: Dependencies,
  id: string,
  mutate: (plan: Plan) => Plan,
): Promise<PlanRecord> {
  const existing = requireRecord(deps, id);
  const plan = mutate(existing.plan);
  const itinerary = await calculateItinerary(plan, deps.routeEstimator);
  const record: PlanRecord = { id, plan, itinerary };
  deps.repository.save(record);
  return record;
}

export function addPickupPointUseCase(
  deps: Dependencies,
  id: string,
  point: PickupPoint,
): Promise<PlanRecord> {
  return recalculateAndSave(deps, id, (plan) => addPickupPointToPlan(plan, point));
}

export function changePickupPointUseCase(
  deps: Dependencies,
  id: string,
  pickupPointId: string,
  updates: { name?: string; location?: Location },
): Promise<PlanRecord> {
  return recalculateAndSave(deps, id, (plan) =>
    changePickupPoint(plan, pickupPointId, updates),
  );
}

export function removePickupPointUseCase(
  deps: Dependencies,
  id: string,
  pickupPointId: string,
): Promise<PlanRecord> {
  return recalculateAndSave(deps, id, (plan) => removePickupPoint(plan, pickupPointId));
}

export function changeOriginUseCase(
  deps: Dependencies,
  id: string,
  newOrigin: Location,
): Promise<PlanRecord> {
  return recalculateAndSave(deps, id, (plan) => changeOrigin(plan, newOrigin));
}

export function changeDestinationUseCase(
  deps: Dependencies,
  id: string,
  newDestination: Location,
): Promise<PlanRecord> {
  return recalculateAndSave(deps, id, (plan) => changeDestination(plan, newDestination));
}
