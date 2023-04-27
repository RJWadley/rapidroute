import { DatabaseDataKeys } from "@rapidroute/database-utils"

import { database } from "./database"
import deepCompare from "./deepCompare"
import { isObject } from "./makeSafeForDatabase"

const keysToIgnore: Record<
  Exclude<keyof typeof database, DatabaseDataKeys>,
  true
> = {
  hashes: true,
  lastImport: true,
}

/**
 * hashes are used to validate cached data,
 * so we need to update them when we update the data
 *
 * this just gives us all new hashes for everything
 */
export default function updateHashes(
  databaseBeforeUpdate: Record<string, unknown>
) {
  const newHash = Math.random().toString(36).slice(2, 15)
  const newHashes: Record<string, string> = {}
  const upcastDatabase: Record<string, unknown> = database

  Object.keys(databaseBeforeUpdate).forEach(key => {
    if (key in keysToIgnore) return
    if (
      key in databaseBeforeUpdate &&
      key in upcastDatabase &&
      isObject(database.hashes) &&
      key in database.hashes
    ) {
      if (deepCompare(databaseBeforeUpdate[key], upcastDatabase[key])) {
        console.log("no change for", key)
      } else {
        // need a new hash if the data has changed
        newHashes[key] = newHash
        console.log("new hash for", key)
      }
    } else {
      // need a new hash if the key is new
      newHashes[key] = newHash
      console.log("new hash for", key)
    }
  })

  database.hashes = { ...database.hashes, ...newHashes }

  database.lastImport = new Date().toISOString()
}
