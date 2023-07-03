import { z } from "zod"

export const routeModes = [
  "flight",
  "seaplane",
  "heli",
  "MRT",
  "walk",
  "spawnWarp",
] as const

export const routeModeSchema = z.union([
  z.literal("flight"),
  z.literal("seaplane"),
  z.literal("heli"),
  z.literal("MRT"),
  z.literal("walk"),
  z.literal("spawnWarp"),
])

export const routePlacesSchema = z.record(
  z.union([z.string(), z.literal("none")])
)

/**
 * a route is a path between two or more places, such as a flight route or a seaplane route
 */
export const routeSchema = z.object({
  /**
   * should match the database key
   */
  uniqueId: z.string(),
  /**
   * the name of this route, if it has one
   */
  name: z.string().optional(),
  /**
   * a short description of the route, if it has one
   */
  description: z.string().optional(),
  /**
   * what type of route is this?
   */
  type: routeModeSchema,
  /**
   * if available, the route number
   */
  number: z.union([z.string(), z.number()]).optional(),
  /**
   * the provider of this route
   */
  provider: z.string(),
  /**
   * a list of keys that can't be overwritten automatically
   */
  manualKeys: z.array(z.string()).optional(),
  /**
   * the places that this route passes through and at which gate or platform
   */
  places: routePlacesSchema,
  /**
   * number of gates this route has
   */
  numGates: z.number().optional(),
})

export const routesSchema = z.record(routeSchema)

export type Route = z.TypeOf<typeof routeSchema>
export type Routes = z.TypeOf<typeof routesSchema>
export type RouteMode = z.TypeOf<typeof routeModeSchema>
export type RoutePlaces = z.TypeOf<typeof routePlacesSchema>

export const isRoute = (obj: unknown): obj is Route =>
  routeSchema.safeParse(obj).success
