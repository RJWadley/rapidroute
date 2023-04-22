/* TODO  max-lines */
// Generated by https://quicktype.io

export interface Markers {
  sets: Sets
  timestamp: number
}

export interface Sets {
  southern: Southern
  forest: Forest
  arctic: Arctic
  northern: Northern
  zephyr: Desert
  mesa: Desert
  plains: Desert
  "worldborder.markerset": WorldborderMarkerset
  expo: Desert
  eastern: Eastern
  cities: Airports
  island: Island
  taiga: Desert
  old: Old
  savannah: Savannah
  airports: Airports
  "roads.a": Roads
  "roads.b": Roads
  lakeshore: Lakeshore
  valley: Valley
  western: Western
  jungle: Jungle
  desert: Desert
  circle: Circle
  markers: SetsMarkers
  union: Union
}

type SharedLinesType = Record<string, PuneHedgehog>

export interface Airports {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: CirclesClass
  layerprio: number
}

export interface CirclesClass {}

export interface Marker {
  markup: boolean
  x: number
  icon: string
  y: number
  dim: Dim
  z: number
  label: string
}

export enum Dim {
  The16X16 = "16x16",
  The32X32 = "32x32",
}

export interface Arctic {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface PuneHedgehog {
  color: string
  markup: boolean
  x: number[]
  y: number[]
  weight: number
  z: number[]
  label: string
  opacity: number
}

export interface Circle {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Desert {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Eastern {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Forest {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Island {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Jungle {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Lakeshore {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface SetsMarkers {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: MarkersMarkers
  lines: CirclesClass
  layerprio: number
}

export interface MarkersMarkers {
  _spawn_new: Marker
}

export interface Northern {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Union {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Old {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: CirclesClass
  lines: CirclesClass
  layerprio: number
}

export interface Roads {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: CirclesClass
  lines: SharedLinesType
  layerprio: number
}

export interface Savannah {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Southern {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Valley {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface Western {
  hide: boolean
  circles: CirclesClass
  areas: CirclesClass
  label: string
  markers: Record<string, Marker>
  lines: SharedLinesType
  layerprio: number
}

export interface WorldborderMarkerset {
  hide: boolean
  circles: CirclesClass
  areas: WorldborderMarkersetAreas
  label: string
  markers: CirclesClass
  lines: CirclesClass
  layerprio: number
}

export interface WorldborderMarkersetAreas {
  worldborder_new: WorldborderNew
}

export interface WorldborderNew {
  fillcolor: string
  ytop: number
  color: string
  markup: boolean
  x: number[]
  weight: number
  z: number[]
  ybottom: number
  label: string
  opacity: number
  fillopacity: number
}

type MRTLines =
  | "southern"
  | "forest"
  | "arctic"
  | "northern"
  | "zephyr"
  | "mesa"
  | "plains"
  | "expo"
  | "eastern"
  | "island"
  | "taiga"
  | "savannah"
  | "lakeshore"
  | "valley"
  | "western"
  | "jungle"
  | "desert"
  | "circle"
  | "union"

export const isMRTLine = (line: string): line is MRTLines => {
  return (
    line === "southern" ||
    line === "forest" ||
    line === "arctic" ||
    line === "northern" ||
    line === "zephyr" ||
    line === "mesa" ||
    line === "plains" ||
    line === "expo" ||
    line === "eastern" ||
    line === "island" ||
    line === "taiga" ||
    line === "savannah" ||
    line === "lakeshore" ||
    line === "valley" ||
    line === "western" ||
    line === "jungle" ||
    line === "desert" ||
    line === "circle" ||
    line === "union"
  )
}

export type MrtTypes = Markers["sets"][MRTLines]

export type MrtLinesTypes = MrtTypes["lines"]
