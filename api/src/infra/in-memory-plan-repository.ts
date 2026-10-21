import type { PlanRecord, PlanRepositoryPort } from "../usecase/plan-repository";

// メモリ上に持つだけ。サーバーを再起動すると消える。あとでDBに差し替える。
export function inMemoryPlanRepository(): PlanRepositoryPort {
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
