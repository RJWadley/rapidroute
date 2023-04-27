import { z } from "zod"

import { isPathingPlace, pathfindingSchema } from "./src/pathfinding"
import { isPlace, placesSchema } from "./src/places"
import { isProvider, providersSchema } from "./src/providers"
import { isRoute, routesSchema } from "./src/routes"
import { isSearchIndexItem, searchIndexSchema } from "./src/searchIndex"

/**
 * used to check if there's new data available. If not, the cached data can be used.
 */
export const hashesSchema = z.object({
  providers: z.string().optional(),
  places: z.string().optional(),
  routes: z.string().optional(),
  pathfinding: z.string().optional(),
  searchIndex: z.string().optional(),
})

/**
 * the whole database
 */
const databaseSchema = z.object({
  /**
   * companies, train lines, etc.
   */
  providers: providersSchema.optional(),
  /**
   * stations, stops, towns, etc.
   */
  places: placesSchema.optional(),
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
 * (e.g. "places", "routes", "providers")
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
  places: isPlace,
  routes: isRoute,
  pathfinding: isPathingPlace,
  searchIndex: isSearchIndexItem,
}

export const isWholeDatabase = (value: unknown): value is DatabaseType =>
  databaseSchema.safeParse(value).success
export const validateDatabase = (value: unknown) =>
  databaseSchema.safeParse(value)

/**
 * exports
 */
export {
  isPathingRouteType,
  Pathfinding,
  PathingPlace,
  pathingRouteTypes,
} from "./src/pathfinding"
export { Place, Places, PlaceType } from "./src/places"
export { Provider, Providers } from "./src/providers"
export { Route, RouteMode, routeModes, RoutePlaces, Routes } from "./src/routes"
export { SearchIndex, SearchIndexItem } from "./src/searchIndex"
