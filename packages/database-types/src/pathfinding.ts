import { z } from "zod"

/**
 * all locations reachable from this location via this mode of transport
 *
 * value key: route location
 * value value: routeIds that can be used to get to that location,
 * N: route name, G: number of gates (0 if undefined)
 */
const shortHandTypeSchema = z.record(
  z.array(
    z.object({
      n: z.string(),
      g: z.number().optional(),
    })
  )
)

export const pathingPlaceSchema = z.object({
  /**
   * should match the database key and the uniqueId of the location
   */
  uniqueId: z.string(),
  /**
   * the X coordinate of the location
   */
  x: z.number().optional(),
  /**
   * the Z coordinate of the location
   */
  z: z.number().optional(),
  /**
   * is a spawn warp
   */
  w: z.boolean().optional(),
  F: shortHandTypeSchema.optional(),
  S: shortHandTypeSchema.optional(),
  H: shortHandTypeSchema.optional(),
  M: shortHandTypeSchema.optional(),
  W: shortHandTypeSchema.optional(),
  P: shortHandTypeSchema.optional(),
})

export const pathfindingSchema = z.record(pathingPlaceSchema)

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

export type PathingPlace = z.TypeOf<typeof pathingPlaceSchema>
export type Pathfinding = z.TypeOf<typeof pathfindingSchema>

export const shortHandMapKeys = ["F", "S", "H", "M", "W", "P"] as const

export const isPathingPlace = (obj: unknown): obj is PathingPlace =>
  pathingPlaceSchema.safeParse(obj).success
export const isWholePathfinding = (obj: unknown): obj is Pathfinding =>
  pathfindingSchema.safeParse(obj).success
