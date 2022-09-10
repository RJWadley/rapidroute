import { Location, RouteMode } from "../types";
import { getDistance } from "./util";

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

const timeMap: {
  // from
  [key: string]: {
    // to
    [key: string]: {
      // mode
      [key in RouteMode]?: number;
    };
  };
} = {};

export const ALL_MODES: RouteMode[] = [
  "flight",
  "seaplane",
  "heli",
  "MRT",
  "walk",
];

export default function getRouteTime(
  start: Location,
  end: Location,
  mode: RouteMode
): number {
  if (timeMap?.[start.uniqueId]?.[end.uniqueId]?.[mode]) {
    return timeMap[start.uniqueId][end.uniqueId][mode] ?? Infinity;
  }

  // generate the route times if they don't exist
  if (!timeMap[start.uniqueId]) timeMap[start.uniqueId] = {};
  if (!timeMap[start.uniqueId][end.uniqueId])
    timeMap[start.uniqueId][end.uniqueId] = {};
  ALL_MODES.forEach((possibleMode) => {
    if (Object.keys(STATIC_TIMES).includes(possibleMode)) {
      timeMap[start.uniqueId][end.uniqueId][possibleMode] =
        STATIC_TIMES[possibleMode];
    }

    if (Object.keys(SPEEDS).includes(possibleMode)) {
      timeMap[start.uniqueId][end.uniqueId][possibleMode] =
        getDistance(start, end) / SPEEDS[possibleMode];
    }
  });

  return timeMap[start.uniqueId][end.uniqueId][mode] ?? Infinity;
}
