import { Route } from "@rapidroute/database-types"

import { getPath } from "data/getData"

export default async function getProvider(route: Route) {
  if (!route?.provider) return undefined
  const provider = await getPath("providers", route.provider)
  if (provider?.alias) {
    const { number } = route
    for (let i = 0; i < provider.alias.length; i += 1) {
      const alias = provider.alias[i]
      if (
        alias.numberRange?.start &&
        alias.numberRange?.end &&
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
