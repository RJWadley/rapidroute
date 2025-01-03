/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { DataDatabaseType, Hashes } from "@rapidroute/database-types"

import { isBrowser } from "./functions"

const latestVersion = 20241229

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
   * date of last pan or zoom on map
   */
  lastMapInteraction: Date
  /**
   * player name to follow on map
   */
  following?: string | number
  /**
   * point of interest to follow on map
   */
  pointOfInterest?: {
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

const urlParameters = [
  "from",
  "to",
  "name",
  "zoom",
  "x",
  "z",
  "following",
] as const
type UrlParameters = (typeof urlParameters)[number]

const ephemeralKeys = [
  "lastMapInteraction",
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

const url = (() => {
  if (!isBrowser()) return new URL("https://example.com")
  return new URL(window.location.href)
})()

let cooldown = false
/**
 * write the url to the browser a max of once per second
 */
const throttledReplace = () => {
  if (cooldown) {
    setTimeout(throttledReplace, 1000)
    return
  }
  // verify that the url is different, but that the path is the same
  if (url.toString() === window.location.href) return
  if (url.pathname !== window.location.pathname) return
  window.history.replaceState({}, "", url.toString())
  cooldown = true
  setTimeout(() => {
    cooldown = false
  }, 1000)
}

const setUrlParameter = <T extends LocalKeys>(key: T, value: Locals[T]) => {
  if (!value) {
    clearUrlParameter(key)
    return
  }
  const previousValue = url.searchParams.get(key)
  if (previousValue === value.toString()) return
  url.searchParams.set(key, value.toString())
  throttledReplace()
}

const getUrlParameter = <T extends LocalKeys>(key: T): Locals[T] | null => {
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
  url.searchParams.delete(key)
  throttledReplace()
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
  if (!isBrowser()) return null
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
  if (!isBrowser()) return
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
  if (!isBrowser()) return
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

const version = getLocal("version")
if (isBrowser()) {
  if (!version || version < latestVersion) {
    localStorage.clear()
    setPersistent("version", latestVersion)
  }
}
