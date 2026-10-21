import type { Itinerary } from "../domain/itinerary";
import type { Plan } from "../domain/plan";

// 計画と、直近の計算結果（行程）をセットで保存する。
// 本物の実装（infra/）は今回はメモリ上だけ。あとでDBに差し替える。
export type PlanRecord = {
  readonly id: string;
  readonly plan: Plan;
  readonly itinerary: Itinerary;
};

export interface PlanRepositoryPort {
  save(record: PlanRecord): void;
  findById(id: string): PlanRecord | undefined;
}
