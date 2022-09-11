import { Locations, Location } from "./locations";
import { Pathfinding, PathingPlace } from "./pathfinding";
import { Providers, Provider } from "./providers";
import { Routes, Route, RouteMode } from "./routes";
import { SearchIndex } from "./searchIndex";
import { Worlds, World } from "./worlds";

export interface DatabaseType {
  /**
   * companies, train lines, etc.
   */
  providers: Providers;
  /**
   * stations, stops, towns, etc.
   */
  locations: Locations;
  /**
   * route by train, bus, etc.
   */
  routes: Routes;
  /**
   * information about the world
   */
  worlds: Worlds;
  /**
   * information needed to perform pathfinding
   */
  pathfinding: Pathfinding;
  /**
   * information needed to perform searching
   */
  searchIndex: SearchIndex;
}

export type Hashes = Record<keyof DatabaseType, string | undefined>;

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
  World,
  Worlds,
  RouteMode,
};