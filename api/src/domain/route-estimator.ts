import type { Location } from "./location";

// docs/design/02-how.md の「経路見積りポート」。
// ドメインは Google Maps Routes API を直接知らない。実装（infra/）は後で足す。
// テストでは、この口を偽物に差し替えて、features/plan.feature の数字をそのまま確認する。
//
// 本物の実装は HTTP 呼び出し（非同期）になるため、このポート自体を非同期にする。
// 最初は同期で設計していたが、Google Maps Routes API を繋ぐ段になって直した
// （docs/design/02-how.md も合わせて作り直す）。
export interface RouteEstimatorPort {
  estimateTravelTime(from: Location, to: Location): Promise<number>; // 分
}
