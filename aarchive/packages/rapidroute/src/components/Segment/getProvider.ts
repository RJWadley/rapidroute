import { Route } from "@rapidroute/database-utils"
import { getPath } from "data/getData"

/**
 * get the provider for a route, accounting for codeshare/alias routes
 * @param route the route to get the provider for
 * @returns the displayed provider for the route
 */
export default async function getProvider(route: Route) {
  if (!route.provider) return
  const provider = await getPath("providers", route.provider)

  /**
   * check if we have an alias for this route
   * if we do, return the aliased provider instead
   */
  if (provider?.alias) {
    const { number } = route
    for (const alias of provider.alias) {
      if (
        alias.numberRange.start &&
        alias.numberRange.end &&
        alias.displayProvider &&
        number &&
        number >= alias.numberRange.start &&
        number <= alias.numberRange.end
      ) {
        return getPath("providers", alias.displayProvider)
      }
    }
  }

  return provider
}
