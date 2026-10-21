import type { Location } from "./location";

// docs/design/02-how.md の「拾ってもらう地点」。同乗者を表す別の型は作らない。
// id を持たせるのは、変更・取消コマンドが「どの地点か」を指し示す必要があるため。
export type PickupPoint = {
  readonly id: string;
  readonly location: Location;
};

export function pickupPoint(id: string, location: Location): PickupPoint {
  return { id, location };
}
