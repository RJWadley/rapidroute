/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { DataDatabaseType, Hashes } from "@rapidroute/database-types"

import { isBrowser } from "./functions"

const latestVersion = 20221015

/**
 * return types from local storage
 */
interface Locals {
  /**
   * cache for the database
   */
  databaseCache: DataDatabaseType
  /**
   * hashes for the database
   */
  oneHash: Hashes
  allHash: Hashes
  /**
   * the currently selected player
   */
  selectedPlayer: string | number
  /**
   * the current dark mode preference
   */
  darkMode: "dark" | "light" | "system"
  /**
   * version of local storage
   */
  version: number
  /**
   * voice to use for tts
   */
  voice: string
  /**
   * speech rate
   */
  speechRate: number
  /**
   * navigation history
   */
  navigationHistory: [string, string][]
  /**
   * true if should show debugging information
   * @deprecated only used on the old map
   */
  isDebug: boolean
  /**
   * date of last pan or zoom on map
   */
  lastMapInteraction: Date
  /**
   * player name to follow on map
   */
  followingPlayer: string | number
  /**
   * point of interest to follow on map
   */
  pointOfInterest: {
    x: number
    z: number
  }
  /**
   * last known location of the user
   */
  lastKnownLocation: {
    x: number
    z: number
  }
  /**
   * how much padding the camera should have around the edge of the screen
   */
  cameraPadding: {
    top: number
    bottom: number
    left: number
    right: number
  }
  from: string
  to: string
  name: string
  zoom: number
  x: number
  z: number
}
type LocalKeys = keyof Locals

const persistentKeys = [
  "databaseCache",
  "oneHash",
  "allHash",
  "selectedPlayer",
  "darkMode",
  "version",
  "voice",
  "speechRate",
  "navigationHistory",
] as const
type PersistentKeys = (typeof persistentKeys)[number]

const urlParameters = ["from", "to", "name", "zoom", "x", "z"] as const
type UrlParameters = (typeof urlParameters)[number]

const ephemeralKeys = [
  "isDebug",
  "lastMapInteraction",
  "followingPlayer",
  "pointOfInterest",
  "lastKnownLocation",
  "cameraPadding",
] as const
type EphemeralKeys = (typeof ephemeralKeys)[number]

const setPersistent = <T extends LocalKeys>(key: T, value: Locals[T]) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const getPersistent = <T extends LocalKeys>(key: T): Locals[T] | null => {
  const value = localStorage.getItem(key)
  if (value === null) {
    return null
  }
  try {
    return JSON.parse(value) as Locals[T]
  } catch {
    return null
  }
}

const clearPersistent = <T extends LocalKeys>(key: T) => {
  localStorage.removeItem(key)
}

const tempStorage: Partial<Locals> = {}

const setEphemeral = <T extends LocalKeys>(key: T, value: Locals[T]) => {
  tempStorage[key] = value
}

const getEphemeral = <T extends LocalKeys>(key: T): Locals[T] | null => {
  const value = tempStorage[key]
  if (value === undefined) {
    return null
  }
  return value
}

const clearEphemeral = <T extends LocalKeys>(key: T) => {
  delete tempStorage[key]
}

const setUrlParameter = <T extends LocalKeys>(key: T, value: Locals[T]) => {
  const url = new URL(window.location.href)
  url.searchParams.set(key, value.toString())
  window.history.replaceState({}, "", url.toString())
}

const getUrlParameter = <T extends LocalKeys>(key: T): Locals[T] | null => {
  const url = new URL(window.location.href)
  const value = url.searchParams.get(key)

  if (value === null) {
    return null
  }

  switch (key) {
    case "zoom":
    case "x":
    case "z":
      return parseFloat(value) as Locals[T]
    default:
      return value as Locals[T]
  }
}

const clearUrlParameter = <T extends LocalKeys>(key: T) => {
  const url = new URL(window.location.href)
  url.searchParams.delete(key)
  window.history.replaceState({}, "", url.toString())
}

const version = getPersistent("version")
if (isBrowser())
  if (!version || version < latestVersion) {
    localStorage.clear()
    setPersistent("version", latestVersion)
  }

const typeSafeIncludes = <T extends string>(
  array: readonly T[],
  key: string
): key is (typeof array)[number] => {
  return (array as readonly string[]).includes(key)
}

export const getLocal = <
  T extends PersistentKeys | EphemeralKeys | UrlParameters
>(
  key: T
): Locals[T] | null => {
  if (typeSafeIncludes(persistentKeys, key)) {
    return getPersistent(key)
  }
  if (typeSafeIncludes(ephemeralKeys, key)) {
    return getEphemeral(key)
  }
  if (typeSafeIncludes(urlParameters, key)) {
    return getUrlParameter(key)
  }
  return null
}

export const setLocal = <T extends keyof Locals>(key: T, value: Locals[T]) => {
  if (typeSafeIncludes(persistentKeys, key)) {
    return setPersistent(key, value)
  }
  if (typeSafeIncludes(ephemeralKeys, key)) {
    return setEphemeral(key, value)
  }
  if (typeSafeIncludes(urlParameters, key)) {
    return setUrlParameter(key, value)
  }
  return null
}

export const clearLocal = <T extends keyof Locals>(key: T) => {
  if (typeSafeIncludes(persistentKeys, key)) {
    return clearPersistent(key)
  }
  if (typeSafeIncludes(ephemeralKeys, key)) {
    return clearEphemeral(key)
  }
  if (typeSafeIncludes(urlParameters, key)) {
    return clearUrlParameter(key)
  }
  return null
}
