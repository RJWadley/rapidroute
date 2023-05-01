import { getItem, removeItem, setItem } from "../config"
import { PathingPlace } from "../schema/pathfinding"
import { isPlace, Place } from "../schema/places"
import { SearchIndexItem } from "../schema/searchIndex"
import { getPathing, setPathing } from "./pathfinding"

/**
 * save a place to the database
 * @param place the place to save
 */
export const setPlace = (place: Place) => {
  const key = `places/${place.uniqueId}`
  const previous = getPlace(place.uniqueId)

  // save any manual keys
  const manualKeys = previous?.manualKeys ?? []
  const manualEntries =
    previous && Object.entries(previous).filter(([k]) => manualKeys.includes(k))

  // create new place & restore manual keys
  const newPlace: Place = {
    ...place,
    ...Object.fromEntries(manualEntries ?? []),
  }
  setItem(key, newPlace)

  // update pathfinding index
  const previousPathing = getPathing(place.uniqueId)
  const newPathing: PathingPlace = {
    ...previousPathing,
    uniqueId: newPlace.uniqueId,
    x: newPlace.coords?.x,
    z: newPlace.coords?.z,
    isWarp: newPlace.isSpawnWarp,
  }
  setPathing(newPlace.uniqueId, newPathing)

  // update search index
  const newSearchIndex: SearchIndexItem = {
    uniqueId: newPlace.uniqueId,
    d: `${newPlace.shortName} - ${newPlace.name}`,
    i: `${newPlace.name} ${newPlace.shortName} ${
      Array.isArray(newPlace.ownerPlayer)
        ? newPlace.ownerPlayer.join(" ")
        : newPlace.ownerPlayer ?? ""
    } ${newPlace.keywords ?? ""}`,
  }

  setItem(`searchIndex/${newPlace.uniqueId}`, newSearchIndex)
}

/**
 * update a place in the database
 * @param place the place to update, may also be partial
 */
export const updatePlace = (place: Partial<Place>) => {
  if (!place.uniqueId) {
    console.error("Cannot update a place without a uniqueId", place)
    return
  }

  const previous = getPlace(`places/${place.uniqueId}`)
  const newPlace = {
    ...previous,
    ...place,
  }

  if (isPlace(newPlace)) setPlace(newPlace)
}

/**
 * remove a place from the database
 * @param placeId the id of the place to delete
 */
export const removePlace = (placeId: string) => {
  removeItem(`places/${placeId}`)

  // update pathfinding index
  removeItem(`pathfinding/${placeId}`)

  // update search index
  removeItem(`searchIndex/${placeId}`)
}

/**
 * get a place from the database
 * @param placeId the id of the place to get
 * @return the place, or undefined if it doesn't exist
 */
export const getPlace = (placeId: string) => {
  const key = `places/${placeId}`
  const place = getItem(key)

  if (!isPlace(place)) {
    if (place) console.warn("Invalid place", placeId)
    return
  }

  return place
}
