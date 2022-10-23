import TSON from "typescript-json"

export interface Pathfinding {
  [key: string]: PathingPlace
}

/**
 * all locations reachable from this location via this mode of transport
 *
 * value key: route location
 * value value: routeIds that can be used to get to that location,
 * N: route name, G: number of gates (0 if undefined)
 */
type ShortHandType = Record<string, { n: string; g?: number }[]>

export interface PathingPlace {
  /**
   * should match the database key and the uniqueId of the location
   */
  uniqueId: string
  /**
   * the X coordinate of the location
   */
  x?: number
  /**
   * the Z coordinate of the location
   */
  z?: number
  /**
   * is a spawn warp
   */
  w?: boolean

  F?: ShortHandType
  S?: ShortHandType
  H?: ShortHandType
  M?: ShortHandType
  W?: ShortHandType
  P?: ShortHandType
}

export const shortHandMap = {
  F: "flight",
  S: "seaplane",
  H: "heli",
  M: "MRT",
  W: "walk",
  P: "spawnWarp",
} as const

export const reverseShortHandMap = {
  flight: "F",
  seaplane: "S",
  heli: "H",
  MRT: "M",
  walk: "W",
  spawnWarp: "P",
} as const

export const shortHandMapKeys = ["F", "S", "H", "M", "W", "P"] as const

export const isPathingPlace = (obj: unknown): obj is PathingPlace =>
  TSON.is<PathingPlace>(obj)
export const isWholePathfinding = (obj: unknown): obj is Pathfinding =>
  TSON.is<Pathfinding>(obj)
