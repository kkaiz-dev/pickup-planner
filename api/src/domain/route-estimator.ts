import type { Location } from "./location";

// docs/design/02-how.md の「経路見積りポート」。
// ドメインは Google Maps Routes API を直接知らない。実装（infra/）は後で足す。
// テストでは、この口を偽物に差し替えて、features/plan.feature の数字をそのまま確認する。
export interface RouteEstimatorPort {
  estimateTravelTime(from: Location, to: Location): number; // 分
}
