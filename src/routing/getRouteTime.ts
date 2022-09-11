/**
 * speed defined in meters per second
 */
const SPEEDS = {
  MRT: 8,
  walk: 2,
};
/**
 * speed is constant regardless of distance
 */
const STATIC_TIMES = {
  flight: 500,
  seaplane: 500,
  heli: 500,
  spawnWarp: 500,
};

type Mode = keyof typeof SPEEDS | keyof typeof STATIC_TIMES;
const inObject = <K extends string, O>(key: K, object: O): key is K & keyof O =>
  key in object;

export default function getRouteTime(distance: number, mode: Mode): number {
  if (distance < 0) return Infinity;

  if (inObject(mode, SPEEDS)) {
    return Math.max(30, distance / SPEEDS[mode]);
  }

  if (inObject(mode, STATIC_TIMES)) {
    return STATIC_TIMES[mode];
  }

  return Infinity;
}
