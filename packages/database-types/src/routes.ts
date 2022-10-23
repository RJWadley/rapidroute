import TSON from "typescript-json"

export interface Routes {
  [key: string]: Route
}

export interface Route {
  /**
   * should match the database key
   */
  uniqueId: string
  /**
   * the name of this route, if it has one
   */
  name?: string
  /**
   * a short description of the route, if it has one
   */
  description?: string
  /**
   * what type of route is this?
   */
  type: RouteMode
  /**
   * if available, the route number
   */
  number?: string | number
  /**
   * the provider of this route
   */
  provider: string
  /**
   * if true, this route may be overwritten automatically
   */
  autoGenerated: boolean | "transit"
  /**
   * the locations that this route passes through and at which gate or platform
   */
  locations: RouteLocations
  /**
   * number of gates
   */
  numGates?: number
}

export type RouteMode =
  | "flight"
  | "seaplane"
  | "heli"
  | "MRT"
  | "walk"
  | "spawnWarp"

export interface RouteLocations {
  [key: string]: string | "none"
}

export const isRoute = (obj: unknown): obj is Route => TSON.is<Route>(obj)
