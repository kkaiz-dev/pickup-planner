import { describe, expect, it } from "vitest";
import { location } from "./location";
import { pickupPoint } from "./pickup-point";

describe("拾ってもらう地点", () => {
  it("名前と場所を持つ", () => {
    const point = pickupPoint("p1", "Aさん", location("〇〇駅"));

    expect(point.name).toBe("Aさん");
    expect(point.location.label).toBe("〇〇駅");
  });
});
