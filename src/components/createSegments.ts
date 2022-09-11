import { Location, Route } from "types";

export interface SegmentType {
  from: Location;
  to: Location;
  routes: (Route | null)[];
}

export default function createSegments(
  locations: (Location | null)[],
  routes: (Route | null)[][]
) {
  const segments: SegmentType[] = [];
  let passAlongMRT: Location | undefined;

  // for each pair of locations, create a segment
  locations.forEach((to, i) => {
    if (i === 0) return;
    const from = passAlongMRT ?? locations[i - 1];
    const afterFrom = locations[i + 1];

    const segmentRoutes = routes[i - 1] ?? [];
    const afterRoutes = routes[i] ?? [];

    if (
      from?.type === "MRT Station" &&
      to?.type === "MRT Station" &&
      afterFrom?.type === "MRT Station" &&
      segmentRoutes.length === 1 &&
      afterRoutes.length === 1
    ) {
      // if there is only one route, pass along the MRT
      passAlongMRT = from;
      return;
    }

    if (from && to)
      segments.push({
        from,
        to,
        routes: segmentRoutes,
      });
    passAlongMRT = undefined;
  });

  return segments;
}
