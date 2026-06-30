import { useLocation, useParams } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights, computeRoute } from "@vercel/speed-insights/react";

export function VercelInsights() {
  const { pathname } = useLocation();
  const params = useParams();
  const routeParams = Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string] => entry[1] !== undefined),
  );
  const route = computeRoute(pathname, routeParams);

  return (
    <>
      <Analytics route={route} path={pathname} />
      <SpeedInsights route={route} />
    </>
  );
}
