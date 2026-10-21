import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { inMemoryPlanRepository } from "../infra/in-memory-plan-repository";
import { stubRouteEstimator } from "../infra/stub-route-estimator";
import * as useCase from "../usecase/plan-usecases";
import type { Location } from "../domain/location";
import type { ClockTime } from "../domain/clock-time";
import type { PickupPoint } from "../domain/pickup-point";

// usecase層（素の関数）と、Nestの DI コンテナを繋ぐだけの薄い層。
// Nestのデフォルトはシングルトンなので、このサービスがプロセスの間、計画を保持し続ける。
@Injectable()
export class PlanService {
  private readonly deps: useCase.Dependencies = {
    repository: inMemoryPlanRepository(),
    routeEstimator: stubRouteEstimator(),
    generateId: () => randomUUID(),
  };

  create(input: { origin: Location; destination: Location; desiredArrivalTime: ClockTime }) {
    return useCase.createPlanUseCase(this.deps, input);
  }

  get(id: string) {
    return useCase.getPlanUseCase(this.deps, id);
  }

  addPickupPoint(id: string, point: PickupPoint) {
    return useCase.addPickupPointUseCase(this.deps, id, point);
  }

  changePickupPointLocation(id: string, pickupPointId: string, newLocation: Location) {
    return useCase.changePickupPointLocationUseCase(this.deps, id, pickupPointId, newLocation);
  }

  removePickupPoint(id: string, pickupPointId: string) {
    return useCase.removePickupPointUseCase(this.deps, id, pickupPointId);
  }

  changeOrigin(id: string, newOrigin: Location) {
    return useCase.changeOriginUseCase(this.deps, id, newOrigin);
  }

  changeDestination(id: string, newDestination: Location) {
    return useCase.changeDestinationUseCase(this.deps, id, newDestination);
  }
}
