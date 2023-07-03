import { z } from "zod"

import { isPathingPlace, pathfindingSchema } from "./src/schema/pathfinding"
import { isPlace, placesSchema } from "./src/schema/places"
import { isProvider, providersSchema } from "./src/schema/providers"
import { isRoute, routesSchema } from "./src/schema/routes"
import { isSearchIndexItem, searchIndexSchema } from "./src/schema/searchIndex"

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
  /**
   * database version
   */
  version: z.string().optional(),
})

export type DatabaseType = z.TypeOf<typeof databaseSchema>

/**
 * data keys are any keys that lead to a data object
 * (e.g. "places", "routes", "providers")
 */
export type DatabaseDataKeys = keyof Omit<
  DatabaseType,
  "hashes" | "lastImport" | "version"
>
export type DataDatabaseType = Omit<
  DatabaseType,
  "hashes" | "lastImport" | "version"
>
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
export const validateDatabase = (value: unknown) => {
  // parse the database with ZOD and return any errors
  try {
    databaseSchema.parse(value)
  } catch (error) {
    if (error instanceof z.ZodError) console.error(error.errors)
  }
}

/**
 * exports
 */
export { setConfig } from "./src/config"
export {
  isPathingRouteType,
  Pathfinding,
  PathingPlace,
  pathingRouteTypes,
} from "./src/schema/pathfinding"
export { Place, Places, PlaceType } from "./src/schema/places"
export { Provider, Providers } from "./src/schema/providers"
export {
  Route,
  RouteMode,
  routeModes,
  RoutePlaces,
  Routes,
} from "./src/schema/routes"
export { SearchIndex, SearchIndexItem } from "./src/schema/searchIndex"
export { default as deepCompare } from "./src/utils/deepCompare"
export {
  isRecord,
  default as makeSafeForDatabase,
} from "./src/utils/makeSafeForDatabase"
export { removePlace, setPlace } from "./src/utils/places"
export { removeProvider, setProvider } from "./src/utils/providers"
export { removeRoute, setRoute } from "./src/utils/routes"
