import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { clockTime, formatClockTime, type ClockTime } from "../domain/clock-time";
import { location } from "../domain/location";
import type { PlanRecord } from "../usecase/plan-repository";
import { PlanService } from "./plan.service";

// HTTP の形だけを扱う。ドメインのルールはここに書かない（docs/README.md の 10）。
function parseClockTime(hhmm: string): ClockTime {
  const [h, m] = hhmm.split(":").map(Number);
  return clockTime(h ?? 0, m ?? 0);
}

function serialize(record: PlanRecord) {
  return {
    id: record.id,
    origin: record.plan.origin.label,
    destination: record.plan.destination.label,
    desiredArrivalTime: formatClockTime(record.plan.desiredArrivalTime),
    pickupPoints: record.plan.pickupPoints.map((p) => ({
      id: p.id,
      name: p.name,
      location: p.location.label,
    })),
    itinerary: record.itinerary.stops.map((s) => ({
      location: s.location.label,
      name: s.name,
      arrival: s.arrival ? formatClockTime(s.arrival) : null,
      departure: formatClockTime(s.departure),
    })),
  };
}

function findOrThrow(service: PlanService, id: string): PlanRecord {
  const record = service.get(id);
  if (!record) {
    throw new NotFoundException(`計画が見つからない: ${id}`);
  }
  return record;
}

@Controller("plans")
export class PlanController {
  // tsx（esbuild）は emitDecoratorMetadata を正しく出力しないため、
  // 型からの自動推論に頼らず @Inject で明示する。
  constructor(@Inject(PlanService) private readonly planService: PlanService) {}

  @Post()
  async create(@Body() body: { origin: string; destination: string; desiredArrivalTime: string }) {
    const record = await this.planService.create({
      origin: location(body.origin),
      destination: location(body.destination),
      desiredArrivalTime: parseClockTime(body.desiredArrivalTime),
    });
    return serialize(record);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return serialize(findOrThrow(this.planService, id));
  }

  @Post(":id/pickup-points")
  async addPickupPoint(
    @Param("id") id: string,
    @Body() body: { id: string; name: string; location: string },
  ) {
    findOrThrow(this.planService, id);
    const record = await this.planService.addPickupPoint(id, {
      id: body.id,
      name: body.name,
      location: location(body.location),
    });
    return serialize(record);
  }

  @Patch(":id/pickup-points/:pointId")
  async changePickupPoint(
    @Param("id") id: string,
    @Param("pointId") pointId: string,
    @Body() body: { name?: string; location?: string },
  ) {
    findOrThrow(this.planService, id);
    const record = await this.planService.changePickupPoint(id, pointId, {
      name: body.name,
      location: body.location ? location(body.location) : undefined,
    });
    return serialize(record);
  }

  @Delete(":id/pickup-points/:pointId")
  async removePickupPoint(@Param("id") id: string, @Param("pointId") pointId: string) {
    findOrThrow(this.planService, id);
    const record = await this.planService.removePickupPoint(id, pointId);
    return serialize(record);
  }

  @Patch(":id/origin")
  async changeOrigin(@Param("id") id: string, @Body() body: { location: string }) {
    findOrThrow(this.planService, id);
    const record = await this.planService.changeOrigin(id, location(body.location));
    return serialize(record);
  }

  @Patch(":id/destination")
  async changeDestination(@Param("id") id: string, @Body() body: { location: string }) {
    findOrThrow(this.planService, id);
    const record = await this.planService.changeDestination(id, location(body.location));
    return serialize(record);
  }
}
