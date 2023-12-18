import type { MarkerSet, MarkersResponse } from "../../../types/dynmapMarkers"
import { isMRTLine } from "../../../types/dynmapMarkers"
import type {
  BareCompany,
  BarePlace,
  BareRoute,
  BareRouteLeg,
} from "../temporaryDatabase"
import { getBothColors } from "./adjustDynmapColors"
import { getCombinedLine } from "./getCombinedLine"
import { getConnections as getRouteLegs } from "./getRouteLegs"
import { getStations } from "./getStations"

const extractAllData = (
  lineName: string,
  set: MarkerSet,
): {
  route: BareRoute
  places: BarePlace[]
  routeLegs: BareRouteLeg[]
} => {
  const allStations: BarePlace[] = getStations(set)
  const { line, isLoop } = getCombinedLine(set)

  console.info(
    `getting routes for ${lineName} (${isLoop ? "loop" : "not loop"})`,
  )

  const route: BareRoute = {
    id: `mrt-${lineName}`,
    name: `MRT ${capitalize(lineName)} line`,
    type: "MRT",
    companyId: "mrt",
  }

  const routeLegs: BareRouteLeg[] = getRouteLegs({
    allStations,
    isLoop,
    line,
    routeId: route.id,
  })

  const baseColor = Object.values(set.lines)[0]?.color ?? "#ff0000"
  const colors = getBothColors(baseColor)

  route.color_dark = colors.dark
  route.color_light = colors.light

  if (lineName === "circle") console.log(JSON.stringify(routeLegs))

  return {
    route,
    routeLegs,
    places: allStations,
  }
}

export default async function importDynmapMRT() {
  const markers = await fetch(
    "https://dynmap.minecartrapidtransit.net/main/tiles/_markers_/marker_new.json",
  )
    .then((res) => res.json())
    .then((data) => data as MarkersResponse)

  const allKeys = Object.keys(markers.sets)

  const results = allKeys.flatMap((lineName) => {
    if (isMRTLine(lineName)) {
      return [extractAllData(lineName, markers.sets[lineName])]
    }
    return []
  })

  const routes = results.flatMap((result) => result.route)
  const routeLegs = results.flatMap((result) => result.routeLegs)
  const places = results.flatMap((result) => result.places)

  const company: BareCompany = {
    id: "mrt",
    name: "MRT",
  }

  return {
    routes,
    routeLegs,
    places,
    company,
  }
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
