export interface LegacyAliases {
  actualProvider: string
  displayProvider: string
  start: string
  end: string
}
export interface LegacyRoute {
  from: string
  to: string
  mode: LegacyMode
  provider?: string
  number?: string
  displayBy?: string
  fromGate?: string
  toGate?: string
}

export interface LegacyPlace {
  id: string
  world: LegacyWorld
  type: LegacyPlaceType
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

export type LegacyMode = "flight" | "seaplane" | "heli" | "MRT"

export type LegacyPlaceType = "MRT" | "airport" | "town"

export type LegacyWorld = "New" | "Old"
