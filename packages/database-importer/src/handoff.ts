import {
  Location,
  Provider,
  Route,
  RouteLocations,
  PlaceType,
} from "@rapidroute/database-types"

import {
  LegacyRoute,
  LegacyPlace,
  LegacyProvider,
  Aliases,
} from "./fetchingTypes"
import saveDataToFirebase from "./saveData"

// can't contain ".", "#", "$", "[", "]", or "/" or "\"
const makeSafe = (str: string) => {
  return str.replace(/[.#$/[\]]/g, "_")
}

/**
 * take the old data format and convert it to the new format
 */
export default async function handoffData(
  routes: LegacyRoute[],
  places: LegacyPlace[],
  providers: LegacyProvider[],
  aliases: Aliases[],
  spawnWarps: string[],
  lightColors: {
    [key: string]: string
  },
  darkColors: {
    [key: string]: string
  },
  logos: Record<string, string>,
  placeLocations: Record<
    string,
    {
      x: number
      y: number
      z: number
    }
  >
) {
  const routesToIgnore: string[] = []
  const mappedRoutes: Route[] = routes
    .map(route => {
      const routeNumber = route.number || null

      // first, we need an unique id for the route that will always be the same
      const placeA = route.from > route.to ? route.to : route.from
      const placeB = route.from > route.to ? route.from : route.to
      const routeId = makeSafe(
        `${route.provider}-${routeNumber ?? placeA + placeB}`
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
      let locations: RouteLocations = {}
      routesWithSameNumber.forEach(y => {
        locations[makeSafe(y.from)] = y.fromGate ?? "none"
      })

      // with a fallback for MRT stations bc they're special
      if (route.mode === "MRT") {
        locations = {
          [makeSafe(route.from)]: "none",
          [makeSafe(route.to)]: "none",
        }
      }

      const mappedRoute: Route = {
        uniqueId: routeId,
        autoGenerated: true,
        name: null,
        description: null,
        locations,
        provider: makeSafe(route.provider ?? ""),
        type: route.mode,
        number: routeNumber || null,
      }
      return mappedRoute
    })
    .flatMap(x => (x ? [x] : []))

  const mappedLocations: Location[] = places.map(place => {
    const locationFromMap = place.shortName
      ? placeLocations[place.shortName]
      : null

    let locationType: PlaceType = "Other"
    if (place.type === "MRT") locationType = "MRT Station"
    if (place.type === "airport") locationType = "Airport"
    if (place.type === "town") locationType = "City"

    const location: Location = {
      uniqueId: makeSafe(place.id),
      name:
        place.displayName ??
        place.longName ??
        place.shortName ??
        "Untitled Location",
      shortName: place.shortName ?? place.id,
      description: null,
      enabled: true,
      IATA: place.type === "airport" ? place.shortName || null : null,
      location:
        place.x && place.z
          ? {
              x: locationFromMap?.x ?? place.x,
              z: locationFromMap?.z ?? place.z,
              y: locationFromMap?.y ?? null,
            }
          : null,
      ownerPlayer: null,
      keywords: place.keywords ?? null,
      world: place.world,
      autoGenerated: true,
      isSpawnWarp: spawnWarps.includes(place.id),
      type: locationType,
      routes: routes
        .filter(y => y.from === place.id || y.to === place.id)
        .map(y => {
          const placeA = y.from > y.to ? y.to : y.from
          const placeB = y.from > y.to ? y.from : y.to
          const routeId = makeSafe(
            `${y.provider}-${y.number ?? placeA + placeB}`
          )
          return routeId
        })
        .filter((value, index, self) => self.indexOf(value) === index),
    }

    return location
  })

  const mappedProviders: Provider[] = providers.map(provider => {
    const newProvider: Provider = {
      uniqueId: makeSafe(provider.name),
      name: provider.displayName ?? provider.name,
      alias: aliases
        .filter(x => x.actualProvider === provider.name)
        .map(x => ({
          displayProvider: x.displayProvider,
          numberRange: {
            start: x.start,
            end: x.end,
          },
        })),
      color: {
        light: lightColors[provider.name] ?? null,
        dark: darkColors[provider.name] ?? null,
      },
      description: null,
      logo: logos[provider.name] ?? null,
      numberPrefix: provider.prefix ?? null,
      ownerPlayer: null,
      autoGenerated: true,
    }

    return newProvider
  })

  saveDataToFirebase(mappedRoutes, mappedLocations, mappedProviders)
}