import TSON from "typescript-json"
import { Locations, Location, PlaceType, isLocation } from "./src/locations"
import {
  isPathingPlace,
  Pathfinding,
  PathingPlace,
  reverseShortHandMap,
  shortHandMap,
  shortHandMapKeys,
} from "./src/pathfinding"
import { Providers, Provider, isProvider } from "./src/providers"
import { Routes, Route, RouteMode, RouteLocations, isRoute } from "./src/routes"
import {
  isSearchIndexItem,
  SearchIndex,
  SearchIndexItem,
} from "./src/searchIndex"
import { Worlds, World } from "./src/worlds"

export interface DatabaseType {
  /**
   * companies, train lines, etc.
   */
  providers?: Providers
  /**
   * stations, stops, towns, etc.
   */
  locations?: Locations
  /**
   * route by train, bus, etc.
   */
  routes?: Routes
  /**
   * information about the world
   */
  // worlds: Worlds
  /**
   * information needed to perform pathfinding
   */
  pathfinding?: Pathfinding
  /**
   * information needed to perform searching
   */
  searchIndex?: SearchIndex
  /**
   * hashes used for validating client-side data
   */
  hashes?: Hashes
  /**
   * date of last import
   */
  lastImport?: string
}

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
  TSON.is<DatabaseType>(value)
export const validateDatabase = (value: unknown) =>
  TSON.validate<DatabaseType>(value)

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
  World,
  Worlds,
  RouteMode,
  shortHandMap,
  reverseShortHandMap,
  shortHandMapKeys,
  RouteLocations,
  PlaceType,
}
