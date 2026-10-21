import type { RouteEstimatorPort } from "../domain/route-estimator";

// 仮の見積り。どの区間も一律 15分 を返す。
// Google Maps Routes API を使った本物の実装は、あとでこれと差し替える
// （docs/design/02-how.md の「経路見積りポート」）。
export function stubRouteEstimator(): RouteEstimatorPort {
  return {
    estimateTravelTime: () => 15,
  };
}
