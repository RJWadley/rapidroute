import { getItem, removeItem, setItem } from "../config"
import { isRoute, Route } from "../schema/routes"
import { updatePathfinding } from "./pathfinding"

/**
 * save a route to the database
 * @param route the route to save
 */
export const setRoute = (route: Route) => {
  const key = `routes/${route.uniqueId}`
  const previous = getRoute(route.uniqueId)

  // save any manual keys
  const manualKeys = new Set([...(previous?.manualKeys ?? []), "manualKeys"])
  const manualEntries =
    previous && Object.entries(previous).filter(([k]) => manualKeys.has(k))

  // create new route & restore manual keys
  const newRoute: Route = {
    ...route,
    ...Object.fromEntries(manualEntries ?? []),
  }
  setItem(key, newRoute)

  // update the pathfinding index
  updatePathfinding(previous, newRoute)
}

/**
 * update a route in the database
 * @param route the new route, may also be partial
 */
export const updateRoute = (route?: Partial<Route>) => {
  if (!route?.uniqueId) {
    console.error("Cannot update a route without a uniqueId", route)
    return
  }

  const previous = getRoute(route.uniqueId)
  const newRoute = {
    ...previous,
    ...route,
  }

  if (isRoute(newRoute)) setRoute(newRoute)
}

/**
 * delete a route from the database
 */
export const removeRoute = (routeId: string) => {
  const previous = getRoute(routeId)

  // delete the route
  removeItem(`routes/${routeId}`)
  updatePathfinding(previous)
}

/**
 * get a route from the database
 * @param routeId the id of the route to get
 * @return the route, or undefined if it doesn't exist
 */
export const getRoute = (routeId: string) => {
  const key = `routes/${routeId}`
  const route = getItem(key)

  if (!isRoute(route)) {
    if (route) console.warn("Invalid route", routeId)
    return
  }

  return route
}
