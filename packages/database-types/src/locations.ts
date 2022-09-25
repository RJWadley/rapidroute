import TSON from "typescript-json"

export interface Locations {
  [key: string]: Location
}

export interface Location {
  /**
   * should match the database key
   */
  uniqueId: string
  /**
   * The display name of the location
   */
  name: string
  /**
   * a short name for the location, less than 5 letters, if possible
   */
  shortName: string
  /**
   * THE IATA code of the location, if it is an airport
   */
  IATA: null | string
  /**
   * a short description of the location
   */
  description: null | string
  /**
   * location within the world
   */
  location: null | Coordinates
  /**
   * owner or owners of the location
   */
  ownerPlayer: null | string | string[]
  /**
   * which world this location is in
   */
  world: string
  /**
   * whether this location is available in routes
   * e.g. a station might be closed or no longer in use
   */
  enabled: boolean
  /**
   * if true, this location may be overwritten automatically
   */
  autoGenerated: boolean
  /**
   * what type of place is this?
   */
  type: PlaceType
  /**
   * can we warp directly to this location from spawn?
   */
  isSpawnWarp: boolean
  /**
   * what route ids are available at this location?
   */
  routes: string[]
  /**
   * search keywords for use in the index
   */
  keywords: null | string
}

export type PlaceType = "City" | "Airport" | "MRT Station" | "Other"

export interface Coordinates {
  x: number
  z: number
  y: null | number
}

export const isLocation = (obj: unknown): obj is Location =>
  TSON.is<Location>(obj)
