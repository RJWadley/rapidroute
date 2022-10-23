export interface Aliases {
  actualProvider: string
  displayProvider: string
  start: string
  end: string
}
export interface LegacyRoute {
  from: string
  to: string
  mode: Mode
  provider?: string
  number?: string
  displayBy?: string
  fromGate?: string
  toGate?: string
}

export interface LegacyPlace {
  id: string
  world: World
  type: PlaceType
  shortName?: string
  longName?: string
  displayName?: string
  x?: number
  z?: number
  keywords?: string
  MRT_TRANSIT_NAME?: string
}

export interface LegacyProvider {
  name: string
  displayName?: string
  prefix?: string
}

export type Mode = "flight" | "seaplane" | "heli" | "MRT"

export type PlaceType = "MRT" | "airport" | "town"

export type World = "New" | "Old"
