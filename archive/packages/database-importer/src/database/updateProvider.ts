import {
  databaseTypeGuards,
  Provider,
  removeProvider,
  setProvider,
} from "@rapidroute/database-utils"

import { database } from "./database"

const isProvider = databaseTypeGuards.providers
let unusedKeys: string[] = []

export function updateProvider(provider: Provider) {
  const providerId = provider.uniqueId
  database.providers ||= {}

  // remove the providerId from the unusedKeys
  unusedKeys = unusedKeys.filter(key => key !== providerId)

  // Save the new provider to the database
  if (isProvider(provider)) setProvider(provider)
}

/**
 * before making any changes to the database, get a list of all the keys
 * in the database so we can remove any that are no longer used after the update
 */
export function beforeProviderUpdate() {
  // get all the providers from the database with no manual keys
  const keys = Object.keys(database.providers ?? {}).filter(
    key => !database.providers?.[key]?.manualKeys
  )

  unusedKeys = keys
}

/**
 * after making changes to the database, remove any locations that were unused or gone
 */
export function afterProviderUpdate() {
  unusedKeys.forEach(key => {
    removeProvider(key)
  })
}
