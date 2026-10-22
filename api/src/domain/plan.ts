import { addMinutes, subtractMinutes, type ClockTime } from "./clock-time";
import type { Itinerary, ItineraryStop } from "./itinerary";
import type { Location } from "./location";
import type { PickupPoint } from "./pickup-point";
import type { RouteEstimatorPort } from "./route-estimator";

// docs/design/02-how.md の「積み込み時間」。v1では常に5分の定数。
const BOARDING_DURATION_MINUTES = 5;

// docs/design/02-how.md の「計画」集約。
export type Plan = {
  readonly origin: Location;
  readonly destination: Location;
  readonly desiredArrivalTime: ClockTime;
  readonly pickupPoints: readonly PickupPoint[];
};

export function createPlan(params: {
  origin: Location;
  destination: Location;
  desiredArrivalTime: ClockTime;
  pickupPoints?: PickupPoint[];
}): Plan {
  return {
    origin: params.origin,
    destination: params.destination,
    desiredArrivalTime: params.desiredArrivalTime,
    pickupPoints: params.pickupPoints ?? [],
  };
}

// 以下、計画を変更する操作。すべて新しい Plan を返す（元の Plan は変えない）。
// 地点が変わったら計算し直す、というポリシー（event-storming/process-level.md）の実行は
// usecase 層の役目。ここでは「変わった後の Plan」を作るところまで。

export function addPickupPoint(plan: Plan, point: PickupPoint): Plan {
  return { ...plan, pickupPoints: [...plan.pickupPoints, point] };
}

export function changePickupPoint(
  plan: Plan,
  pickupPointId: string,
  updates: { name?: string; location?: Location },
): Plan {
  return {
    ...plan,
    pickupPoints: plan.pickupPoints.map((p) =>
      p.id === pickupPointId ? { ...p, ...updates } : p,
    ),
  };
}

export function removePickupPoint(plan: Plan, pickupPointId: string): Plan {
  return {
    ...plan,
    pickupPoints: plan.pickupPoints.filter((p) => p.id !== pickupPointId),
  };
}

export function changeOrigin(plan: Plan, newOrigin: Location): Plan {
  return { ...plan, origin: newOrigin };
}

export function changeDestination(plan: Plan, newDestination: Location): Plan {
  return { ...plan, destination: newDestination };
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [items.slice()];
  const result: T[][] = [];
  items.forEach((item, i) => {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const restOrder of permutations(rest)) {
      result.push([item, ...restOrder]);
    }
  });
  return result;
}

async function totalMinutesFor(
  origin: Location,
  destination: Location,
  order: readonly PickupPoint[],
  estimator: RouteEstimatorPort,
): Promise<number> {
  const legs: Location[] = [origin, ...order.map((p) => p.location), destination];
  let minutes = 0;
  for (let i = 0; i < legs.length - 1; i++) {
    minutes += await estimator.estimateTravelTime(legs[i]!, legs[i + 1]!);
  }
  minutes += order.length * BOARDING_DURATION_MINUTES;
  return minutes;
}

async function bestOrder(
  origin: Location,
  destination: Location,
  pickupPoints: readonly PickupPoint[],
  estimator: RouteEstimatorPort,
): Promise<{ order: readonly PickupPoint[]; totalMinutes: number }> {
  let best: { order: readonly PickupPoint[]; totalMinutes: number } | undefined;
  for (const order of permutations(pickupPoints)) {
    const totalMinutes = await totalMinutesFor(origin, destination, order, estimator);
    if (!best || totalMinutes < best.totalMinutes) {
      best = { order, totalMinutes };
    }
  }
  // pickupPoints が0個でも permutations は [[]] を返すので、必ず best は存在する。
  return best!;
}

async function buildStops(
  plan: Plan,
  order: readonly PickupPoint[],
  originDeparture: ClockTime,
  estimator: RouteEstimatorPort,
): Promise<ItineraryStop[]> {
  const stops: ItineraryStop[] = [
    { location: plan.origin, name: null, arrival: null, departure: originDeparture },
  ];

  let previousLocation = plan.origin;
  let currentTime = originDeparture;
  for (const point of order) {
    const travelMinutes = await estimator.estimateTravelTime(previousLocation, point.location);
    const arrival = addMinutes(currentTime, travelMinutes);
    const departure = addMinutes(arrival, BOARDING_DURATION_MINUTES);
    stops.push({ location: point.location, name: point.name, arrival, departure });
    currentTime = departure;
    previousLocation = point.location;
  }

  const travelToDestination = await estimator.estimateTravelTime(previousLocation, plan.destination);
  const destinationArrival = addMinutes(currentTime, travelToDestination);
  stops.push({ location: plan.destination, name: null, arrival: destinationArrival, departure: destinationArrival });

  return stops;
}

// docs/design/02-how.md の「行程を計算する」の擬似コードをそのまま実装したもの。
// 経路見積りポートがHTTP呼び出し（非同期）になるため、ここも非同期。
export async function calculateItinerary(plan: Plan, estimator: RouteEstimatorPort): Promise<Itinerary> {
  const { order, totalMinutes } = await bestOrder(
    plan.origin,
    plan.destination,
    plan.pickupPoints,
    estimator,
  );
  const originDeparture = subtractMinutes(plan.desiredArrivalTime, totalMinutes);
  const stops = await buildStops(plan, order, originDeparture, estimator);
  return { stops };
}
