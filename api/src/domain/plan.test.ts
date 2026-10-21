import { describe, expect, it } from "vitest";
import { clockTime, formatClockTime } from "./clock-time";
import { location } from "./location";
import { pickupPoint } from "./pickup-point";
import { calculateItinerary, createPlan } from "./plan";
import type { RouteEstimatorPort } from "./route-estimator";

// features/plan.feature の3シナリオをそのままテストにする。
// 積み込み時間は5分固定（docs/design/01-what.md）。

function fakeEstimator(table: Record<string, number>): RouteEstimatorPort {
  return {
    estimateTravelTime(from, to) {
      const key = `${from.label}->${to.label}`;
      const minutes = table[key];
      if (minutes === undefined) {
        throw new Error(`見積りが無い区間: ${key}`);
      }
      return minutes;
    },
  };
}

describe("運転者が送迎計画を作る", () => {
  it("同乗者がいないとき、到着希望時刻から出発時刻を逆算する", () => {
    // 前提 出発地から目的地までの所要時間は 40分 である
    const origin = location("出発地");
    const destination = location("目的地");
    const estimator = fakeEstimator({ "出発地->目的地": 40 });

    // もし 運転者が到着希望時刻を 7:00 として送迎計画を作る
    const plan = createPlan({
      origin,
      destination,
      desiredArrivalTime: clockTime(7, 0),
    });
    const itinerary = calculateItinerary(plan, estimator);

    // ならば 出発時刻は 6:20 になる
    expect(formatClockTime(itinerary.stops[0]!.departure)).toBe("06:20");
  });

  it("同乗者が1人いるとき、お迎えの順番と各地点の時刻が決まる", () => {
    // 前提 出発地から Aさんの家 までの所要時間は 10分 である
    // かつ Aさんの家 から目的地までの所要時間は 30分 である
    const origin = location("出発地");
    const destination = location("目的地");
    const a = location("Aさんの家");
    const estimator = fakeEstimator({
      "出発地->Aさんの家": 10,
      "Aさんの家->目的地": 30,
    });

    // もし 運転者が到着希望時刻を 7:00 として送迎計画を作る
    const plan = createPlan({
      origin,
      destination,
      desiredArrivalTime: clockTime(7, 0),
      pickupPoints: [pickupPoint("p1", a)],
    });
    const itinerary = calculateItinerary(plan, estimator);

    // ならば お迎えの順番は 出発地、Aさんの家、目的地 の順になる
    expect(itinerary.stops.map((s) => s.location.label)).toEqual([
      "出発地",
      "Aさんの家",
      "目的地",
    ]);
    // かつ 出発時刻は 6:15 になる
    expect(formatClockTime(itinerary.stops[0]!.departure)).toBe("06:15");
    // かつ Aさんの家 には 6:25 に着き、6:30 に出る
    expect(formatClockTime(itinerary.stops[1]!.arrival!)).toBe("06:25");
    expect(formatClockTime(itinerary.stops[1]!.departure)).toBe("06:30");
  });

  it("同乗者が2人いて、順番によって所要時間が変わるとき、短い方の順番が選ばれる", () => {
    const origin = location("出発地");
    const destination = location("目的地");
    const a = location("Aさんの家");
    const b = location("Bさんの家");
    // 前提 出発地→A 10分、A→B 15分、B→目的地 20分（合計45分、積み込み10分で55分）
    // かつ 出発地→B 25分、B→A 15分、A→目的地 15分（合計55分、積み込み10分で65分）
    const estimator = fakeEstimator({
      "出発地->Aさんの家": 10,
      "Aさんの家->Bさんの家": 15,
      "Bさんの家->目的地": 20,
      "出発地->Bさんの家": 25,
      "Bさんの家->Aさんの家": 15,
      "Aさんの家->目的地": 15,
    });

    const plan = createPlan({
      origin,
      destination,
      desiredArrivalTime: clockTime(7, 0),
      pickupPoints: [pickupPoint("p1", a), pickupPoint("p2", b)],
    });
    const itinerary = calculateItinerary(plan, estimator);

    // ならば お迎えの順番は 出発地、Aさんの家、Bさんの家、目的地 の順になる
    expect(itinerary.stops.map((s) => s.location.label)).toEqual([
      "出発地",
      "Aさんの家",
      "Bさんの家",
      "目的地",
    ]);
  });

  it("同乗者が0人でも計画は成立する", () => {
    // docs/design/02-how.md の不変条件
    const plan = createPlan({
      origin: location("出発地"),
      destination: location("目的地"),
      desiredArrivalTime: clockTime(7, 0),
    });

    expect(plan.pickupPoints).toEqual([]);
  });
});
