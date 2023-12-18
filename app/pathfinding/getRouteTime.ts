import type { RouteType } from "@prisma/client"

/**
 * speed defined in meters per second
 */
export const SPEEDS = {
  MRT: 8,
  Walk: 2,
} satisfies Partial<Record<RouteType, number>>

/**
 * speed is constant regardless of distance
 */
export const STATIC_TIMES = {
  PlaneFlight: 500,
  SeaplaneFlight: 500,
  HelicopterFlight: 500,
  SpawnWarp: 500,
} satisfies Partial<Record<RouteType, number>>

export const GATE_PENALTY = {
  PlaneFlight: (n: number) => Math.max(2 - n, 0) * 60,
  SeaplaneFlight: (n: number) => Math.max(2 - n, 0) * 60,
  HelicopterFlight: (n: number) => Math.max(2 - n, 0) * 60,
} satisfies Partial<Record<RouteType, (n: number) => number>>

type Mode = keyof typeof SPEEDS | keyof typeof STATIC_TIMES
export const inObject = <
  K extends string,
  O extends Record<string | number, unknown>,
>(
  key: K,
  object: O,
): key is K & keyof O => key in object

export default function getRouteTime(
  distance: number,
  mode?: Mode,
  numberOfGates = 0,
): number {
  if (distance < 0) return Infinity
  if (!mode) return Infinity

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
