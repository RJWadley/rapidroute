import { BarePlace, BareProvider } from "types/aliases"
import { isMRTLine, MarkerSet, MarkersResponse } from "types/dynmapMarkers"
import { updateRoutePlaces, updateThing } from "updater/utils/updateThing"

import { getBothColors } from "./adjustDynmapColors"
import { getCombinedLine } from "./getCombinedLine"
import { getRoutes } from "./getRoutes"
import { getStations } from "./getStations"

const extractAllData = (
  lineName: string,
  set: MarkerSet
): {
  routes: ReturnType<typeof getRoutes>
  places: BarePlace[]
  provider: BareProvider
} => {
  const allStations: BarePlace[] = getStations(set)
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

  const provider: BareProvider = {
    id: lineName.trim(),
    color_dark: colors.dark,
    color_light: colors.light,
    logo: null,
    name: set.label,
    manual_keys: [],
    number_prefix: null,
    operators: null,
  }

  return {
    provider,
    routes,
    places: allStations,
  }
}

export default async function importDynmapMRT() {
  const markers = await fetch(
    "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
  )
    .then((res) => res.json())
    .then((data: MarkersResponse) => data)

  const allKeys = Object.keys(markers.sets)

  const results = allKeys.flatMap((lineName) => {
    if (isMRTLine(lineName)) {
      return [extractAllData(lineName, markers.sets[lineName])]
    }
    return []
  })

  const routes = results.flatMap((result) => result.routes)
  const places = results.flatMap((result) => result.places)
  const providers = results.map((result) => result.provider)

  const placePromises = places.map(async (newPlace) => {
    return updateThing("place", newPlace)
  })

  const providerPromises = providers.map(async (newProvider) => {
    return updateThing("provider", newProvider)
  })

  await Promise.all(placePromises)
  await Promise.all(providerPromises)

  const routePromises = routes.map(async (newRoute) => {
    await updateThing("route", newRoute.route)

    const stopPromises = newRoute.places.map(async (newStop) => {
      await updateRoutePlaces(newStop)
    })

    await Promise.all(stopPromises)
  })

  await Promise.all(routePromises)
}
