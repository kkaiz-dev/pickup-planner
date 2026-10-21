import { calculateItinerary, changeDestination, changeOrigin, changePickupPointLocation, createPlan, removePickupPoint, addPickupPoint as addPickupPointToPlan, type Plan } from "../domain/plan";
import type { Location } from "../domain/location";
import type { PickupPoint } from "../domain/pickup-point";
import type { RouteEstimatorPort } from "../domain/route-estimator";
import type { PlanRecord, PlanRepositoryPort } from "./plan-repository";

// event-storming/process-level.md のポリシーをここで実行する。
// 「計画ができたら／地点が変わったら／出発地・目的地が変わったら、計算し直す」。
export type Dependencies = {
  repository: PlanRepositoryPort;
  routeEstimator: RouteEstimatorPort;
  generateId: () => string;
};

export function createPlanUseCase(
  deps: Dependencies,
  input: { origin: Location; destination: Location; desiredArrivalTime: Plan["desiredArrivalTime"] },
): PlanRecord {
  const plan = createPlan(input);
  const itinerary = calculateItinerary(plan, deps.routeEstimator);
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

function recalculateAndSave(deps: Dependencies, id: string, mutate: (plan: Plan) => Plan): PlanRecord {
  const existing = requireRecord(deps, id);
  const plan = mutate(existing.plan);
  const itinerary = calculateItinerary(plan, deps.routeEstimator);
  const record: PlanRecord = { id, plan, itinerary };
  deps.repository.save(record);
  return record;
}

export function addPickupPointUseCase(deps: Dependencies, id: string, point: PickupPoint): PlanRecord {
  return recalculateAndSave(deps, id, (plan) => addPickupPointToPlan(plan, point));
}

export function changePickupPointLocationUseCase(
  deps: Dependencies,
  id: string,
  pickupPointId: string,
  newLocation: Location,
): PlanRecord {
  return recalculateAndSave(deps, id, (plan) =>
    changePickupPointLocation(plan, pickupPointId, newLocation),
  );
}

export function removePickupPointUseCase(deps: Dependencies, id: string, pickupPointId: string): PlanRecord {
  return recalculateAndSave(deps, id, (plan) => removePickupPoint(plan, pickupPointId));
}

export function changeOriginUseCase(deps: Dependencies, id: string, newOrigin: Location): PlanRecord {
  return recalculateAndSave(deps, id, (plan) => changeOrigin(plan, newOrigin));
}

export function changeDestinationUseCase(
  deps: Dependencies,
  id: string,
  newDestination: Location,
): PlanRecord {
  return recalculateAndSave(deps, id, (plan) => changeDestination(plan, newDestination));
}
