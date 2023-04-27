import {
  databaseTypeGuards,
  isPathingRouteType,
  pathingRouteTypes,
  Route,
} from "@rapidroute/database-utils"

import { database } from "./database"
import deepCompare from "./deepCompare"
import { isObject } from "./makeSafeForDatabase"

const isRoute = databaseTypeGuards.routes
const unusedKeys: Record<string, string[]> = {}

export function setRoute(routeId: string, route: Route | undefined | null) {
  if (!database.routes) database.routes = {}
  if (!database.pathfinding) database.pathfinding = {}

  // remove the routeId from the unusedKeys
  Object.entries(unusedKeys).forEach(([key, value]) => {
    unusedKeys[key] = value.filter(id => id !== routeId)
  })

  // Get the previous route from the database
  const thisRoute = database.routes[routeId]
  const previousRoute: Route | undefined = thisRoute
    ? {
        ...thisRoute,
        uniqueId: routeId,
      }
    : undefined

  // Validate the previous route. If it's invalid, throw an error
  if (isObject(previousRoute)) previousRoute.uniqueId = routeId
  // check for any changes
  if (deepCompare(previousRoute, route)) return

  if (
    previousRoute !== undefined &&
    previousRoute !== null &&
    !isRoute(previousRoute)
  ) {
    console.log(previousRoute)
    throw new Error(`Invalid route: ${routeId}`)
  }

  // if the previous route is not auto-generated, skip it
  if (previousRoute?.autoGenerated === false) {
    console.log("Skipping a non-auto-generated route", routeId)
    return
  }
  // verify the route is meant to come from this source
  if (
    route &&
    previousRoute &&
    !previousRoute.autoGenerated &&
    previousRoute.autoGenerated !== route.autoGenerated
  ) {
    console.log("Source mismatch, skipping", routeId)
    return
  }

  // Save the new route to the database
  if (route) database.routes[routeId] = route
  else delete database.routes[routeId]

  // if the route locations don't match the previous route, update the pathfinding index
  if (!deepCompare(previousRoute?.places, route?.places)) {
    console.log("Updating pathfinding index for", routeId)
    // remove this route from any locations it was previously in
    if (previousRoute) {
      // for every location in the pathfinding index
      Object.keys(previousRoute.places).forEach(locationId => {
        const location = database.pathfinding?.[locationId]
        // check every mode in that location
        pathingRouteTypes.forEach(shortHand => {
          // check every location in that mode
          const secondLocation = location?.[shortHand]
          if (secondLocation)
            Object.entries(secondLocation).forEach(
              ([secondLocId, routesToPlace]) => {
                // actually remove the route from the list
                const newRoutesToPlace = routesToPlace.filter(
                  r => r.routeName !== routeId
                )
                // update the pathfinding index
                if (!database.pathfinding) database.pathfinding = {}
                database.pathfinding[locationId] = {
                  ...database.pathfinding[locationId],
                  [shortHand]: {
                    ...database.pathfinding[locationId][shortHand],
                    [secondLocId]: newRoutesToPlace,
                  },
                }
              }
            )
        })
      })
    }

    // add this route to the locations it's in
    if (route) {
      Object.keys(route.places).forEach(locationId => {
        const location = database.pathfinding?.[locationId] || {}
        const mode = route.type
        if (!isPathingRouteType(mode)) return
        if (location[mode] === undefined) {
          location[mode] = {}
        }
        const routes = location[mode]?.[routeId] || []
        routes.push({
          routeName: routeId,
          numberOfGates: route.numGates,
        })
        Object.keys(route.places).forEach(toLocation => {
          if (toLocation !== locationId) {
            // add the route to the pathfinding index
            if (!database.pathfinding) database.pathfinding = {}
            database.pathfinding[locationId] = {
              ...location,
              [mode]: {
                ...location[mode],
                [toLocation]: routes,
              },
            }
          }
        })
      })
    }
  }

  console.log(
    route
      ? `Successfully saved route ${routeId}`
      : `Successfully deleted route ${routeId}`
  )
}

/**
 * before making any changes to the database, get a list of all the keys
 * in the database so we can remove any that are no longer used after the update
 * @param source the source of the data, currently not used (but will be in the future)
 */
export function beforeRouteUpdate(source: string | true = true) {
  // get all the routes from the database where autoGenerated matches source
  const keys = Object.keys(database.routes || {}).filter(
    key => database.routes?.[key]?.autoGenerated === source
  )
  const sourceAsKey = source === true ? "true" : source
  unusedKeys[sourceAsKey] = keys || []
}

/**
 * after making changes to the database, remove any locations that were unused or gone
 * @param source the source of the data, currently not used (but will be in the future)
 */
export function afterRouteUpdate(source: string | true = true) {
  const sourceAsKey = typeof source === "string" ? source : "true"
  const keysToRemove = unusedKeys[sourceAsKey]
  if (keysToRemove !== undefined) {
    keysToRemove.forEach(key => setRoute(key, undefined))
  }
}
