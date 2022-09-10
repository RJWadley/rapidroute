import { RouteMode } from "../types";

/**
 * speed defined in meters per second
 */
const SPEEDS: Record<string, number> = {
  MRT: 8,
  walk: 2,
};
/**
 * speed is constant regardless of distance
 */
const STATIC_TIMES: Record<string, number> = {
  flight: 500,
  seaplane: 500,
  heli: 500,
  spawnWarp: 500,
};

export const ALL_MODES: RouteMode[] = [
  "flight",
  "seaplane",
  "heli",
  "MRT",
  "walk",
];

export default function getRouteTime(
  distance: number,
  mode: RouteMode
): number {
  if (distance < 0) return Infinity;

  if (Object.keys(STATIC_TIMES).includes(mode)) {
    return STATIC_TIMES[mode];
  }

  if (Object.keys(SPEEDS).includes(mode)) {
    return distance / SPEEDS[mode];
  }

  return Infinity;
}
