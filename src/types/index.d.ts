import { Providers } from "./providers";
import { Locations } from "./locations";
import { Routes } from "./routes";
import { Pathfinding } from "./pathfinding";
import { SearchIndex } from "./searchIndex";
import { Worlds } from "./worlds";

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
