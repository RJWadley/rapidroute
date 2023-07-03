import { z } from "zod"

export const placeTypeSchema = z.union([
  z.literal("City"),
  z.literal("Airport"),
  z.literal("MRT Station"),
  z.literal("Other"),
  z.literal("Coordinate"),
])

export const coordinatesSchema = z.object({
  x: z.number(),
  z: z.number(),
  y: z.number().optional(),
})

/**
 * a place is a location on the map, such as a city, airport, or MRT station
 */
export const placeSchema = z.object({
  /**
   * should match the database key
   */
  uniqueId: z.string(),
  /**
   * The display name of the place
   */
  name: z.string(),
  /**
   * a short name for the place, less than 5 letters, if possible
   */
  shortName: z.string(),
  /**
   * THE IATA code of the place, if it is an airport
   */
  IATA: z.string().optional(),
  /**
   * a short description of the place
   */
  description: z.string().optional(),
  /**
   * place within the world
   */
  coords: coordinatesSchema.optional(),
  /**
   * owner or owners of the place
   */
  ownerPlayer: z.union([z.string(), z.array(z.string())]).optional(),
  /**
   * which world this place is in
   */
  world: z.string(),
  /**
   * whether this place is available in routes
   * e.g. a station might be closed or no longer in use
   */
  enabled: z.boolean(),
  /**
   * a list of keys that can't be overwritten automatically
   */
  manualKeys: z.array(z.string()).optional(),
  /**
   * what type of place is this?
   */
  type: placeTypeSchema,
  /**
   * can we warp directly to this place from spawn?
   */
  isSpawnWarp: z.boolean().optional(),
  /**
   * what route ids, if any, are available at this place?
   */
  routes: z.array(z.string()).optional(),
  /**
   * search keywords for use in the index
   */
  keywords: z.string().optional(),
})

export const placesSchema = z.record(placeSchema)

export type Place = z.TypeOf<typeof placeSchema>
export type Places = z.TypeOf<typeof placesSchema>
export type PlaceType = z.TypeOf<typeof placeTypeSchema>

export const isPlace = (obj: unknown): obj is Place =>
  placeSchema.safeParse(obj).success
