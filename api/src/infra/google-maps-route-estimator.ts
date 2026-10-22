import type { Location } from "../domain/location";
import type { RouteEstimatorPort } from "../domain/route-estimator";

// docs/design/02-how.md の「経路見積りポート」の本物の実装。
// Google Maps の Routes API（Compute Routes）を使う。
// Location.label は実際の住所・地名の文字列として、そのまま住所として渡す。
const COMPUTE_ROUTES_URL = "https://routes.googleapis.com/directions/v2:computeRoutes";

type ComputeRoutesResponse = {
  routes?: { duration?: string }[]; // 例: "123s"
};

function parseDurationSeconds(duration: string | undefined): number {
  if (!duration) {
    throw new Error("Routes API のレスポンスに duration が無い");
  }
  const match = /^(\d+)s$/.exec(duration);
  if (!match) {
    throw new Error(`duration の形式が想定外: ${duration}`);
  }
  return Number(match[1]);
}

export function googleMapsRouteEstimator(apiKey: string): RouteEstimatorPort {
  // 同じ区間を何度も聞かない（順列探索で同じ区間が繰り返し出てくるため）。
  const cache = new Map<string, Promise<number>>();

  async function fetchTravelMinutes(from: Location, to: Location): Promise<number> {
    const res = await fetch(COMPUTE_ROUTES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration",
      },
      body: JSON.stringify({
        origin: { address: from.label },
        destination: { address: to.label },
        travelMode: "DRIVE",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Routes API が失敗した（${res.status}）: ${body}`);
    }

    const data = (await res.json()) as ComputeRoutesResponse;
    const seconds = parseDurationSeconds(data.routes?.[0]?.duration);
    return Math.round(seconds / 60);
  }

  return {
    estimateTravelTime(from, to) {
      const key = `${from.label}->${to.label}`;
      const cached = cache.get(key);
      if (cached) return cached;

      const promise = fetchTravelMinutes(from, to);
      cache.set(key, promise);
      return promise;
    },
  };
}
