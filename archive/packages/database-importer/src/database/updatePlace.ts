import {
  databaseTypeGuards,
  Place,
  removePlace,
  setPlace,
} from "@rapidroute/database-utils"

import { database } from "./database"

const isPlace = databaseTypeGuards.places
let unusedKeys: string[] = []

export function updatePlace(place: Place) {
  const placeId = place.uniqueId
  database.places ||= {}
  database.pathfinding ||= {}
  database.searchIndex ||= {}

  // remove the locationId from the unusedKeys
  unusedKeys = unusedKeys.filter(key => key !== placeId)

  // Save the new location to the database
  if (isPlace(place)) setPlace(place)
  else removePlace(placeId)
}

/**
 * before making any changes to the database, get a list of all the keys
 * in the database so we can remove any that are no longer used after the update
 * @param source the source of the data, currently not used (but will be in the future)
 */
export function beforeLocationUpdate() {
  // get all the locations from the database where the keys are not manually set
  const keys = Object.keys(database.places ?? {}).filter(
    key => !database.places?.[key]?.manualKeys
  )

  unusedKeys = keys
}

/**
 * after making changes to the database, remove any locations that were unused or gone
 */
export function afterLocationUpdate() {
  unusedKeys.forEach(key => removePlace(key))
}
