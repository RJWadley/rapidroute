import TSON from "typescript-json"

interface MapData {
  aRoads: Record<string, RoadA>
  bRoads: Record<string, RoadB>
}

interface MapObject {
  zIndex?: number
}
export const isMapObject = (x: unknown): x is MapObject => TSON.is<MapObject>(x)

/* ROADS */

interface Road extends MapObject {}
export const isRoad = (x: unknown): x is Road => TSON.is<Road>(x)

interface RoadA extends Road {}
export const isRoadA = (node: unknown): node is RoadA => TSON.is<RoadA>(node)

interface RoadB extends Road {}
export const isRoadB = (node: unknown): node is RoadB => TSON.is<RoadB>(node)

/* BUILDINGS */

interface Building extends MapObject {}
export const isBuilding = (x: unknown): x is Building => TSON.is<Building>(x)
