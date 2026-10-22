import { describe, expect, it } from "vitest";
import { clockTime, formatClockTime } from "./clock-time";
import { location } from "./location";
import { pickupPoint } from "./pickup-point";
import {
  addPickupPoint,
  calculateItinerary,
  changeDestination,
  changeOrigin,
  changePickupPoint,
  createPlan,
  removePickupPoint,
} from "./plan";
import type { RouteEstimatorPort } from "./route-estimator";

function fakeEstimator(table: Record<string, number>): RouteEstimatorPort {
  return {
    async estimateTravelTime(from, to) {
      const key = `${from.label}->${to.label}`;
      const minutes = table[key];
      if (minutes === undefined) {
        throw new Error(`見積りが無い区間: ${key}`);
      }
      return minutes;
    },
  };
}

// features/pickup-points.feature
describe("同乗者が拾ってもらう地点を管理する", () => {
  it("地点を追加すると、お迎えの順番に含まれる", async () => {
    const origin = location("出発地");
    const destination = location("目的地");
    const a = location("Aさんの家");
    const estimator = fakeEstimator({
      "出発地->Aさんの家": 10,
      "Aさんの家->目的地": 30,
    });

    const plan = createPlan({ origin, destination, desiredArrivalTime: clockTime(7, 0) });
    const updated = addPickupPoint(plan, pickupPoint("p1", "Aさん", a));
    const itinerary = await calculateItinerary(updated, estimator);

    expect(itinerary.stops.map((s) => s.location.label)).toEqual([
      "出発地",
      "Aさんの家",
      "目的地",
    ]);
  });

  it("地点を変更すると、新しい場所に置き換わる", async () => {
    const origin = location("出発地");
    const destination = location("目的地");
    const a = location("Aさんの家");
    const newA = location("Aさんの新しい家");
    const estimator = fakeEstimator({
      "出発地->Aさんの新しい家": 12,
      "Aさんの新しい家->目的地": 28,
    });

    const plan = createPlan({
      origin,
      destination,
      desiredArrivalTime: clockTime(7, 0),
      pickupPoints: [pickupPoint("p1", "Aさん", a)],
    });
    const updated = changePickupPoint(plan, "p1", { location: newA });
    const itinerary = await calculateItinerary(updated, estimator);

    const labels = itinerary.stops.map((s) => s.location.label);
    expect(labels).toContain("Aさんの新しい家");
    expect(labels).not.toContain("Aさんの家");
  });

  it("地点を取り消すと、お迎えの順番から消える", async () => {
    const origin = location("出発地");
    const destination = location("目的地");
    const a = location("Aさんの家");
    const b = location("Bさんの家");
    const estimator = fakeEstimator({
      "出発地->Bさんの家": 20,
      "Bさんの家->目的地": 15,
    });

    const plan = createPlan({
      origin,
      destination,
      desiredArrivalTime: clockTime(7, 0),
      pickupPoints: [pickupPoint("p1", "Aさん", a), pickupPoint("p2", "Bさん", b)],
    });
    const updated = removePickupPoint(plan, "p1");
    const itinerary = await calculateItinerary(updated, estimator);

    const labels = itinerary.stops.map((s) => s.location.label);
    expect(labels).not.toContain("Aさんの家");
    expect(labels).toContain("Bさんの家");
  });
});

// features/change-plan.feature
describe("運転者が計画の出発地・目的地を変える", () => {
  it("出発地を変更すると、計画の出発地が置き換わる", async () => {
    const plan = createPlan({
      origin: location("出発地"),
      destination: location("目的地"),
      desiredArrivalTime: clockTime(7, 0),
    });

    const updated = changeOrigin(plan, location("新しい出発地"));

    expect(updated.origin.label).toBe("新しい出発地");
  });

  it("目的地を変更すると、計画の目的地が置き換わる", async () => {
    const plan = createPlan({
      origin: location("出発地"),
      destination: location("目的地"),
      desiredArrivalTime: clockTime(7, 0),
    });

    const updated = changeDestination(plan, location("新しい目的地"));

    expect(updated.destination.label).toBe("新しい目的地");
  });
});
