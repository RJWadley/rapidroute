import {
  Place,
  PlaceType,
  Provider,
  Route,
  RoutePlaces,
} from "@rapidroute/database-utils"

import getLegacyData from "./getSheetData"

/**
 * update string to be a valid firebase key
 *
 * can't contain ".", "#", "$", "[", "]", or "/" or "\"
 * replace those with "_1", "_2", "_3", "_4", etc.
 * also replace " " with "_" and "_" with "__"
 *
 * @param str
 * @returns
 */
const makeKeySafe = (str: string) => {
  return str
    .replace(/_/g, "__")
    .replace(/\./g, "_1")
    .replace(/#/g, "_2")
    .replace(/\$/g, "_3")
    .replace(/\[/g, "_4")
    .replace(/]/g, "_5")
    .replace(/\//g, "_6")
    .replace(/\\/g, "_7")
    .replace(/ /g, "_")
}

/**
 * take the old data format (from RapidRoute 2) and convert it to the new format
 */
export default async function getConvertedData() {
  const {
    routes,
    places,
    providers,
    aliases,
    spawnWarps,
    lightColors,
    darkColors,
    logos,
    placeLocations,
  } = await getLegacyData()

  const routesToIgnore: string[] = []
  const mappedRoutes: Route[] = routes
    .map(route => {
      const routeNumber = route.number ?? undefined

      // first, we need an unique id for the route that will always be the same
      const placeA = route.from > route.to ? route.to : route.from
      const placeB = route.from > route.to ? route.from : route.to
      const provider = route.provider ?? `unknown${route.from}${route.to}`
      const routeId = makeKeySafe(
        `${provider}-${routeNumber ?? placeA + placeB}`
      )

      // if we've already seen this route, ignore it the second time
      if (routesToIgnore.includes(routeId)) {
        return null
      }
      routesToIgnore.push(routeId)

      // and collect locations and gate info for the route
      const routesWithSameNumber = routes.filter(
        y => y.number === route.number && y.provider === route.provider
      )
      let locations: RoutePlaces = {}
      const gates: Record<string, string> = {}
      routesWithSameNumber.forEach(y => {
        locations[makeKeySafe(y.from)] = y.fromGate ?? "none"

        const fromGate = gates[y.from] || y.fromGate
        if (fromGate) gates[y.from] = fromGate
        const toGate = gates[y.to] || y.toGate
        if (toGate) gates[y.to] = toGate
      })

      // with a fallback for MRT stations bc they're special
      if (route.mode === "MRT") {
        locations = {
          [makeKeySafe(route.from)]: "none",
          [makeKeySafe(route.to)]: "none",
        }
      }

      const numGates = Object.keys(gates).length
      const mappedRoute: Route = {
        uniqueId: routeId,
        name: undefined,
        description: undefined,
        places: locations,
        provider: makeKeySafe(route.provider ?? ""),
        type: route.mode,
        number: routeNumber ?? undefined,
        numGates: numGates > 0 ? numGates : undefined,
      }
      return mappedRoute
    })
    .flatMap(x => (x ? [x] : []))

  const mappedLocations: Place[] = places.map(place => {
    const locationFromMap = place.shortName
      ? placeLocations[place.shortName]
      : undefined

    let locationType: PlaceType = "Other"
    if (place.type === "MRT") locationType = "MRT Station"
    if (place.type === "airport") locationType = "Airport"
    if (place.type === "town") locationType = "City"

    const location: Place = {
      uniqueId: makeKeySafe(place.id),
      name:
        place.displayName ??
        place.longName ??
        place.shortName ??
        "Untitled Location",
      shortName: place.shortName ?? place.id,
      description: undefined,
      enabled: true,
      IATA: place.type === "airport" ? place.shortName ?? undefined : undefined,
      coords:
        place.x && place.z
          ? {
              x: locationFromMap?.x ?? place.x,
              z: locationFromMap?.z ?? place.z,
              y: locationFromMap?.y ?? undefined,
            }
          : undefined,
      ownerPlayer: undefined,
      keywords: place.keywords ?? undefined,
      world: place.world,
      isSpawnWarp: spawnWarps.includes(place.id),
      type: locationType,
      routes: routes
        .filter(y => y.from === place.id || y.to === place.id)
        .map(y => {
          const placeA = y.from > y.to ? y.to : y.from
          const placeB = y.from > y.to ? y.from : y.to
          const provider = y.provider ?? `unknown${y.from}${y.to}`
          return makeKeySafe(`${provider}-${y.number ?? placeA + placeB}`)
        })
        .filter((value, index, self) => self.indexOf(value) === index),
    }

    return location
  })

  const mappedProviders: Provider[] = providers.map(provider => {
    const lightColor = lightColors[provider.name]
    const darkColor = darkColors[provider.name]

    const newProvider: Provider = {
      uniqueId: makeKeySafe(provider.name),
      name: provider.displayName ?? provider.name,
      alias: aliases
        .filter(x => x.actualProvider === provider.name)
        .map(x => ({
          displayProvider: makeKeySafe(x.displayProvider),
          numberRange: {
            start: x.start,
            end: x.end,
          },
        })),
      color:
        lightColor && darkColor
          ? { light: lightColor, dark: darkColor }
          : undefined,
      description: undefined,
      logo: logos[provider.name],
      numberPrefix: provider.prefix,
      ownerPlayer: undefined,
    }

    return newProvider
  })

  return {
    routes: mappedRoutes,
    locations: mappedLocations,
    providers: mappedProviders,
  }
}
