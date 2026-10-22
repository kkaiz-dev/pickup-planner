import type { ClockTime } from "./clock-time";
import type { Location } from "./location";

// docs/design/02-how.md の「行程」。お迎えの順番と、各地点の到着・出発時刻。
// 出発地は到着がない（arrival が null）。目的地は積み込みが無いので到着=出発。
// name は、拾ってもらう地点のときだけ入る（誰を迎えに行くか分かるように、Day12）。
// 出発地・目的地には同乗者がいないので無い。
export type ItineraryStop = {
  readonly location: Location;
  readonly name: string | null;
  readonly arrival: ClockTime | null;
  readonly departure: ClockTime;
};

export type Itinerary = {
  readonly stops: readonly ItineraryStop[]; // [出発地, ...拾ってもらう地点（順番どおり）, 目的地]
};
