import type { RouteEstimatorPort } from "../domain/route-estimator";
import { googleMapsRouteEstimator } from "./google-maps-route-estimator";
import { stubRouteEstimator } from "./stub-route-estimator";

// GOOGLE_MAPS_API_KEY があれば本物、無ければ仮の見積りを使う。
// 鍵が無い状態でも（ローカルでキー未設定のときなど）アプリ自体は動くようにする。
export function routeEstimatorFromEnv(): RouteEstimatorPort {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    return googleMapsRouteEstimator(apiKey);
  }
  // eslint-disable-next-line no-console
  console.warn(
    "GOOGLE_MAPS_API_KEY が設定されていないため、仮の見積り（どの区間も15分）を使う。",
  );
  return stubRouteEstimator();
}
