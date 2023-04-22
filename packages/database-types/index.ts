import { z } from "zod"

import { isLocation, locationsSchema } from "./src/locations"
import { isPathingPlace, pathfindingSchema } from "./src/pathfinding"
import { isProvider, providersSchema } from "./src/providers"
import { isRoute, routesSchema } from "./src/routes"
import { isSearchIndexItem, searchIndexSchema } from "./src/searchIndex"

export const hashesSchema = z.object({
  providers: z.string().optional(),
  locations: z.string().optional(),
  routes: z.string().optional(),
  pathfinding: z.string().optional(),
  searchIndex: z.string().optional(),
})

const databaseSchema = z.object({
  /**
   * companies, train lines, etc.
   */
  providers: providersSchema.optional(),
  /**
   * stations, stops, towns, etc.
   */
  locations: locationsSchema.optional(),
  /**
   * route by train, bus, etc.
   */
  routes: routesSchema.optional(),
  /**
   * information needed to perform pathfinding
   */
  pathfinding: pathfindingSchema.optional(),
  /**
   * information needed to perform searching
   */
  searchIndex: searchIndexSchema.optional(),
  /**
   * hashes used for validating client-side data
   */
  hashes: hashesSchema.optional(),
  /**
   * date of last import
   */
  lastImport: z.string().optional(),
})

export type DatabaseType = z.TypeOf<typeof databaseSchema>

/**
 * data keys are any keys that lead to a data object
 * (e.g. "locations", "routes", "providers")
 */
export type DatabaseDataKeys = keyof Omit<DatabaseType, "hashes" | "lastImport">
export type DataDatabaseType = Omit<DatabaseType, "hashes" | "lastImport">
export type Hashes = Partial<Record<DatabaseDataKeys, string>>

export const databaseTypeGuards: {
  [key in DatabaseDataKeys]: (
    value: unknown
  ) => value is NonNullable<DatabaseType[key]>[string]
} = {
  providers: isProvider,
  locations: isLocation,
  routes: isRoute,
  pathfinding: isPathingPlace,
  searchIndex: isSearchIndexItem,
}

export const isWholeDatabase = (value: unknown): value is DatabaseType =>
  databaseSchema.safeParse(value).success
export const validateDatabase = (value: unknown) =>
  databaseSchema.safeParse(value)

export { Location, Locations, PlaceType } from "./src/locations"
export {
  Pathfinding,
  PathingPlace as PathfindingEdge,
  reverseShortHandMap,
  shortHandMap,
  shortHandMapKeys,
} from "./src/pathfinding"
export { Provider, Providers } from "./src/providers"
export { Route, RouteLocations, RouteMode, Routes } from "./src/routes"
export { SearchIndex, SearchIndexItem } from "./src/searchIndex"
