import { getItem, setItem } from "../config"
import {
  isPathingPlace,
  isPathingRouteType,
  pathingRouteTypes,
} from "../schema/pathfinding"
import { Route } from "../schema/routes"
import deepCompare from "./deepCompare"
import { isRecord } from "./makeSafeForDatabase"

export const getPathing = (key: string) => {
  const pathing = getItem(`pathfinding/${key}`)

  if (!isPathingPlace(pathing)) {
    return
  }

  return pathing
}

export const setPathing = (key: string, value: unknown) => {
  const valueToSet = isRecord(value)
    ? {
        ...value,
        uniqueId: key,
      }
    : undefined
  if (!isPathingPlace(valueToSet)) {
    console.info(valueToSet)
    console.info(getItem(`places/${key}`))
    throw new Error("Invalid pathing value: " + key)
  }

  setItem(`pathfinding/${key}`, valueToSet)
}

export const updatePathfinding = (previousRoute?: Route, route?: Route) => {
  const routeId = route?.uniqueId ?? previousRoute?.uniqueId
  if (!routeId) throw new Error("No routeId was provided")

  // if the route locations don't match the previous route, update the pathfinding index
  if (!deepCompare(previousRoute?.places, route?.places)) {
    // remove this route from any locations it was previously in
    if (previousRoute) {
      // for every location in the pathfinding index
      for (const locationId of Object.keys(previousRoute.places)) {
        const location = getPathing(locationId)

        // check every mode in that location
        for (const routeMode of pathingRouteTypes) {
          // check every location in that mode
          const secondLocation = location?.[routeMode]

          if (secondLocation)
            Object.entries(secondLocation).forEach(
              ([secondLocId, routesToPlace]) => {
                // actually remove the route from the list
                const newRoutesToPlace = routesToPlace.filter(
                  r => r.routeName !== routeId
                )

                // update the pathfinding index
                setPathing(locationId, {
                  ...location,
                  [routeMode]: {
                    ...location[routeMode],
                    [secondLocId]: newRoutesToPlace,
                  },
                })
              }
            )
        }
      }
    }

    // add this route to the locations it's in
    if (route) {
      Object.keys(route.places).forEach(locationId => {
        const location = getPathing(locationId)
        const mode = route.type
        if (!isPathingRouteType(mode)) return
        const routes = location?.[mode]?.[routeId] ?? []
        routes.push({
          routeName: routeId,
          numberOfGates: route.numGates,
        })

        Object.keys(route.places).forEach(toLocation => {
          if (toLocation !== locationId) {
            // add the route to the pathfinding index
            setPathing(locationId, {
              ...location,
              [mode]: {
                ...location?.[mode],
                [toLocation]: routes,
              },
            })
          }
        })
      })
    }
  }
}
