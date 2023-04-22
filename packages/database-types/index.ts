import { z } from "zod"
import {
  Locations,
  Location,
  PlaceType,
  isLocation,
  locationsSchema,
} from "./src/locations"
import {
  isPathingPlace,
  Pathfinding,
  pathfindingSchema,
  PathingPlace,
  reverseShortHandMap,
  shortHandMap,
  shortHandMapKeys,
} from "./src/pathfinding"
import {
  Providers,
  Provider,
  isProvider,
  providersSchema,
} from "./src/providers"
import {
  Routes,
  Route,
  RouteMode,
  RouteLocations,
  isRoute,
  routesSchema,
} from "./src/routes"
import {
  isSearchIndexItem,
  SearchIndex,
  SearchIndexItem,
  searchIndexSchema,
} from "./src/searchIndex"

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

export {
  Provider,
  Providers,
  Location,
  Locations,
  Route,
  Routes,
  Pathfinding,
  PathingPlace as PathfindingEdge,
  SearchIndex,
  SearchIndexItem,
  RouteMode,
  shortHandMap,
  reverseShortHandMap,
  shortHandMapKeys,
  RouteLocations,
  PlaceType,
}
