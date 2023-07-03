import { z } from "zod"

const placesReachableSchema = z.record(
  z.array(
    z.object({
      /**
       * the name of the route that visits this place
       */
      routeName: z.string(),
      /**
       * how many gates are available on this route?
       */
      numberOfGates: z.number().optional(),
    })
  )
)

/**
 * this schema contains the bare minimum information needed to pathfind between two places
 */
export const pathingPlaceSchema = z.object({
  /**
   * should match the database key and the uniqueId of the place
   */
  uniqueId: z.string(),
  /**
   * the X coordinate of the place
   */
  x: z.number().optional(),
  /**
   * the Z coordinate of the place
   */
  z: z.number().optional(),
  /**
   * is a spawn warp
   */
  isWarp: z.boolean().optional(),
  /**
   * all places reachable from this place via a flight
   */
  flight: placesReachableSchema.optional(),
  /**
   * all places reachable from this place via a seaplane
   */
  seaplane: placesReachableSchema.optional(),
  /**
   * all places reachable from this place via a helicopter
   */
  heli: placesReachableSchema.optional(),
  /**
   * all places reachable from this place via the MRT
   */
  MRT: placesReachableSchema.optional(),
})

export const pathfindingSchema = z.record(pathingPlaceSchema)

/**
 * all the types of routes that are found in a pathfinding object
 * use routeModes for all types
 */
export const pathingRouteTypes = ["flight", "seaplane", "heli", "MRT"] as const
export const isPathingRouteType = (
  obj: unknown
): obj is (typeof pathingRouteTypes)[number] =>
  pathingRouteTypes.includes(obj as (typeof pathingRouteTypes)[number])

export type PathingPlace = z.TypeOf<typeof pathingPlaceSchema>
export type Pathfinding = z.TypeOf<typeof pathfindingSchema>

export const isPathingPlace = (obj: unknown): obj is PathingPlace =>
  pathingPlaceSchema.safeParse(obj).success
export const isWholePathfinding = (obj: unknown): obj is Pathfinding =>
  pathfindingSchema.safeParse(obj).success
