import type { ClockTime } from "./clock-time";
import type { Location } from "./location";

// docs/design/02-how.md の「行程」。お迎えの順番と、各地点の到着・出発時刻。
// 出発地は到着がない（arrival が null）。目的地は積み込みが無いので到着=出発。
export type ItineraryStop = {
  readonly location: Location;
  readonly arrival: ClockTime | null;
  readonly departure: ClockTime;
};

export type Itinerary = {
  readonly stops: readonly ItineraryStop[]; // [出発地, ...拾ってもらう地点（順番どおり）, 目的地]
};
