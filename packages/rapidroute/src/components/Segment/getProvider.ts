import { Provider, Route } from "@rapidroute/database-types"

import { getPath } from "data/getData"

export default function getProvider(
  route: Route,
  setProvider: (provider: Provider) => void
) {
  if (route?.provider)
    getPath("providers", route.provider).then(newProvider => {
      if (newProvider) setProvider(newProvider)
      if (newProvider?.alias) {
        const { number } = route
        newProvider.alias.forEach(alias => {
          if (
            alias.numberRange?.start &&
            alias.numberRange?.end &&
            alias.displayProvider &&
            number &&
            number >= alias.numberRange.start &&
            number <= alias.numberRange.end
          ) {
            getPath("providers", alias.displayProvider).then(aliasProvider => {
              if (aliasProvider) setProvider(aliasProvider)
            })
          }
        })
      }
    })
}
