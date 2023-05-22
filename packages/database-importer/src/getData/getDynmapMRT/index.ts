import { Place, Provider, Route } from "@rapidroute/database-utils"

import { isMRTLine, MarkerResponse, MarkerSet } from "../../types/markersType"
import { getBothColors } from "./dynmapColors"
import { getCombinedLine } from "./getCombinedLine"
import { getRoutes } from "./getRoutes"
import { getStations } from "./getStations"

export default async function getDynmapMRT() {
  const markers = await fetch(
    "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
  )
    .then(res => res.json())
    .then((data: MarkerResponse) => data)

  const allKeys = Object.keys(markers.sets)

  const results = allKeys.flatMap(lineName => {
    if (isMRTLine(lineName)) {
      return [extractAllData(lineName, markers.sets[lineName])]
    }
    return []
  })

  const routes = results.flatMap(result => result.routes)
  const places = results.flatMap(result => result.places)
  const providers = results.map(result => result.provider)

  return {
    providers,
    routes,
    places,
  }
}

const extractAllData = (
  lineName: string,
  set: MarkerSet
): {
  routes: Route[]
  places: Place[]
  provider: Provider
} => {
  const allStations: Place[] = getStations(set)
  const { line, isLoop } = getCombinedLine(set)

  console.info(
    `getting routes for ${lineName} (${isLoop ? "loop" : "not loop"})`
  )

  const routes = getRoutes({
    allStations,
    isLoop,
    line,
    lineName,
  })

  const baseColor = Object.values(set.lines)[0]?.color ?? "#ff0000"
  const colors = getBothColors(baseColor)

  const provider: Provider = {
    uniqueId: lineName,
    color: colors,
    name: set.label,
  }

  return {
    provider,
    routes,
    places: allStations,
  }
}
