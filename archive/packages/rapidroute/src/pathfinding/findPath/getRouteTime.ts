/*  no-bitwise */
/**
 * speed defined in meters per second
 */
export const SPEEDS = {
  MRT: 8,
  walk: 2,
}

/**
 * speed is constant regardless of distance
 */
export const STATIC_TIMES = {
  flight: 500,
  seaplane: 500,
  heli: 500,
  spawnWarp: 500,
}

export const GATE_PENALTY = {
  flight: (n: number) => Math.max(2 - n, 0) * 60,
  seaplane: (n: number) => Math.max(2 - n, 0) * 60,
  heli: (n: number) => Math.max(2 - n, 0) * 60,
}

type Mode = keyof typeof SPEEDS | keyof typeof STATIC_TIMES
export const inObject = <
  K extends string,
  O extends Record<string | number, unknown>
>(
  key: K,
  object: O
): key is K & keyof O => key in object

export default function getRouteTime(
  distance: number,
  mode: Mode,
  numberOfGates = 0
): number {
  if (distance < 0) return Infinity

  const gatePenalty = inObject(mode, GATE_PENALTY)
    ? GATE_PENALTY[mode](numberOfGates)
    : 0

  if (inObject(mode, SPEEDS)) {
    return Math.max(30, distance / SPEEDS[mode]) + gatePenalty
  }

  if (inObject(mode, STATIC_TIMES)) {
    return STATIC_TIMES[mode] + gatePenalty
  }

  return Infinity
}
