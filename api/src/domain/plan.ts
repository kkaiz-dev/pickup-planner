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

function totalMinutesFor(
  origin: Location,
  destination: Location,
  order: readonly PickupPoint[],
  estimator: RouteEstimatorPort,
): number {
  const legs: Location[] = [origin, ...order.map((p) => p.location), destination];
  let minutes = 0;
  for (let i = 0; i < legs.length - 1; i++) {
    minutes += estimator.estimateTravelTime(legs[i]!, legs[i + 1]!);
  }
  minutes += order.length * BOARDING_DURATION_MINUTES;
  return minutes;
}

function bestOrder(
  origin: Location,
  destination: Location,
  pickupPoints: readonly PickupPoint[],
  estimator: RouteEstimatorPort,
): { order: readonly PickupPoint[]; totalMinutes: number } {
  let best: { order: readonly PickupPoint[]; totalMinutes: number } | undefined;
  for (const order of permutations(pickupPoints)) {
    const totalMinutes = totalMinutesFor(origin, destination, order, estimator);
    if (!best || totalMinutes < best.totalMinutes) {
      best = { order, totalMinutes };
    }
  }
  // pickupPoints が0個でも permutations は [[]] を返すので、必ず best は存在する。
  return best!;
}

function buildStops(
  plan: Plan,
  order: readonly PickupPoint[],
  originDeparture: ClockTime,
  estimator: RouteEstimatorPort,
): ItineraryStop[] {
  const stops: ItineraryStop[] = [
    { location: plan.origin, arrival: null, departure: originDeparture },
  ];

  let previousLocation = plan.origin;
  let currentTime = originDeparture;
  for (const point of order) {
    const travelMinutes = estimator.estimateTravelTime(previousLocation, point.location);
    const arrival = addMinutes(currentTime, travelMinutes);
    const departure = addMinutes(arrival, BOARDING_DURATION_MINUTES);
    stops.push({ location: point.location, arrival, departure });
    currentTime = departure;
    previousLocation = point.location;
  }

  const travelToDestination = estimator.estimateTravelTime(previousLocation, plan.destination);
  const destinationArrival = addMinutes(currentTime, travelToDestination);
  stops.push({ location: plan.destination, arrival: destinationArrival, departure: destinationArrival });

  return stops;
}

// docs/design/02-how.md の「行程を計算する」の擬似コードをそのまま実装したもの。
export function calculateItinerary(plan: Plan, estimator: RouteEstimatorPort): Itinerary {
  const { order, totalMinutes } = bestOrder(
    plan.origin,
    plan.destination,
    plan.pickupPoints,
    estimator,
  );
  const originDeparture = subtractMinutes(plan.desiredArrivalTime, totalMinutes);
  const stops = buildStops(plan, order, originDeparture, estimator);
  return { stops };
}
