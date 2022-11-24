import TSON from "typescript-json"
import { AutoGenIndex, isAutoGenIndex } from "./src/autoGenIndex"
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
import { Worlds, World, isWorld } from "./src/worlds"

export interface DatabaseType {
  /**
   * companies, train lines, etc.
   */
  providers: Providers
  /**
   * stations, stops, towns, etc.
   */
  locations: Locations
  /**
   * route by train, bus, etc.
   */
  routes: Routes
  /**
   * information about the world
   */
  // worlds: Worlds
  /**
   * information needed to perform pathfinding
   */
  pathfinding: Pathfinding
  /**
   * information needed to perform searching
   */
  searchIndex: SearchIndex
  /**
   * auto-generated index of locations
   */
  autoGenIndex: AutoGenIndex
}

export type Hashes = Record<keyof DatabaseType, string | undefined>

export const databaseTypeGuards: {
  [key in keyof DatabaseType]: (
    value: unknown
  ) => value is DatabaseType[key][string]
} = {
  providers: isProvider,
  locations: isLocation,
  routes: isRoute,
  // worlds: isWorld,
  pathfinding: isPathingPlace,
  searchIndex: isSearchIndexItem,
  autoGenIndex: isAutoGenIndex,
}

export const isPartialWholeDatabase = (
  value: unknown
): value is Partial<DatabaseType> => TSON.is<Partial<DatabaseType>>(value)
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
