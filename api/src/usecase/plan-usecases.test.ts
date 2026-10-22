import { describe, expect, it } from "vitest";
import { clockTime } from "../domain/clock-time";
import { location } from "../domain/location";
import type { RouteEstimatorPort } from "../domain/route-estimator";
import type { PlanRecord, PlanRepositoryPort } from "./plan-repository";
import {
  addPickupPointUseCase,
  changeDestinationUseCase,
  changeOriginUseCase,
  changePickupPointUseCase,
  createPlanUseCase,
  getPlanUseCase,
  removePickupPointUseCase,
} from "./plan-usecases";

function inMemoryRepository(): PlanRepositoryPort {
  const store = new Map<string, PlanRecord>();
  return {
    save(record) {
      store.set(record.id, record);
    },
    findById(id) {
      return store.get(id);
    },
  };
}

function fakeEstimator(minutes: number): RouteEstimatorPort {
  // Day8では見積りの中身は問わない。固定値を返すだけ（本物はDay10で足す）。
  return { estimateTravelTime: async () => minutes };
}

function deps() {
  return {
    repository: inMemoryRepository(),
    routeEstimator: fakeEstimator(10),
    generateId: (() => {
      let n = 0;
      return () => `plan-${++n}`;
    })(),
  };
}

describe("計画のusecase", () => {
  it("計画を作ると、保存されて取得できる", async () => {
    const d = deps();
    const created = await createPlanUseCase(d, {
      origin: location("出発地"),
      destination: location("目的地"),
      desiredArrivalTime: clockTime(7, 0),
    });

    const fetched = getPlanUseCase(d, created.id);

    expect(fetched).toEqual(created);
    expect(created.itinerary.stops.map((s) => s.location.label)).toEqual([
      "出発地",
      "目的地",
    ]);
  });

  it("地点を追加すると、保存された計画が更新される", async () => {
    const d = deps();
    const created = await createPlanUseCase(d, {
      origin: location("出発地"),
      destination: location("目的地"),
      desiredArrivalTime: clockTime(7, 0),
    });

    const updated = await addPickupPointUseCase(d, created.id, {
      id: "p1",
      name: "Aさん",
      location: location("Aさんの家"),
    });

    expect(updated.itinerary.stops.map((s) => s.location.label)).toEqual([
      "出発地",
      "Aさんの家",
      "目的地",
    ]);
    expect(getPlanUseCase(d, created.id)).toEqual(updated);
  });

  it("地点の変更・取消・出発地/目的地の変更も、保存された計画に反映される", async () => {
    const d = deps();
    const created = await createPlanUseCase(d, {
      origin: location("出発地"),
      destination: location("目的地"),
      desiredArrivalTime: clockTime(7, 0),
    });
    await addPickupPointUseCase(d, created.id, { id: "p1", name: "Aさん", location: location("Aさんの家") });

    const changed = await changePickupPointUseCase(d, created.id, "p1", {
      location: location("Aさんの新しい家"),
    });
    expect(changed.plan.pickupPoints[0]!.location.label).toBe("Aさんの新しい家");

    const removed = await removePickupPointUseCase(d, created.id, "p1");
    expect(removed.plan.pickupPoints).toHaveLength(0);

    const originChanged = await changeOriginUseCase(d, created.id, location("新しい出発地"));
    expect(originChanged.plan.origin.label).toBe("新しい出発地");

    const destinationChanged = await changeDestinationUseCase(d, created.id, location("新しい目的地"));
    expect(destinationChanged.plan.destination.label).toBe("新しい目的地");
  });
});
