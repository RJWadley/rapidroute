import {
  databaseTypeGuards,
  removeRoute,
  Route,
  setRoute,
} from "@rapidroute/database-utils"

import { database } from "./database"

const isRoute = databaseTypeGuards.routes
let unusedKeys: string[] = []

/**
 * save a route to the database
 * @param route the route to save
 */
export function updateRoute(route: Route) {
  const routeId = route.uniqueId
  database.routes ||= {}
  database.pathfinding ||= {}

  // remove the routeId from the unusedKeys
  unusedKeys = unusedKeys.filter(key => key !== routeId)

  // Save the new route to the database
  if (isRoute(route)) setRoute(route)
}

/**
 * before making any changes to the database, get a list of all the keys
 * in the database so we can remove any that are no longer used after the update
 */
export function beforeRouteUpdate() {
  // get all the routes from the database with no manual keys
  const keys = Object.keys(database.routes ?? {}).filter(
    key => !database.routes?.[key]?.manualKeys
  )

  unusedKeys = keys
}

/**
 * after making changes to the database, remove any locations that were unused or gone
 */
export function afterRouteUpdate() {
  unusedKeys.forEach(key => removeRoute(key))
}
