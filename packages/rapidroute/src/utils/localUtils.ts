import { DataDatabaseType, Hashes } from "@rapidroute/database-types"

import { isBrowser } from "./functions"

const version = new Date("2023-04-22")

const typeSafeIncludes = <T extends string>(
  array: readonly T[],
  key: string
): key is (typeof array)[number] => {
  return (array as readonly string[]).includes(key)
}

/**
 * === TYPES ===
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
] satisfies readonly (keyof Locals)[]
type PersistentKeys = (typeof persistentKeys)[number]

const urlParameters = [
  "from",
  "to",
  "name",
  "zoom",
  "x",
  "z",
  "following",
] satisfies readonly Exclude<keyof Locals, PersistentKeys>[]
type UrlParameters = (typeof urlParameters)[number]

const ephemeralKeys = [
  "lastMapInteraction",
  "pointOfInterest",
  "lastKnownLocation",
  "cameraPadding",
] satisfies readonly Exclude<keyof Locals, PersistentKeys | UrlParameters>[]
type EphemeralKeys = (typeof ephemeralKeys)[number]

type LocalKeys = PersistentKeys | UrlParameters | EphemeralKeys

const locals: Partial<Locals> = {}

/**
 * === FUNCTIONS ===
 */

/**
 * schedules an update to the URL parameters
 * updates happen every second on the second
 */
const saveAllUrlParameters = () => {
  if (updatePending) return
  updatePending = true
  const now = new Date()
  const seconds = now.getSeconds()
  const milliseconds = now.getMilliseconds()
  const timeout = 1000 - milliseconds + (seconds % 2 === 0 ? 0 : 500)
  setTimeout(() => {
    updatePending = false
    const url = new URL(window.location.href)
    for (const key of urlParameters) {
      if (locals[key]) {
        url.searchParams.set(key, locals[key] as string)
      } else {
        url.searchParams.delete(key)
      }
    }
    window.history.replaceState({ path: url.href }, "", url.href)
  }, timeout)
}
let updatePending = false

/**
 * saves just the given key to local storage
 */
const saveToLocalStorage = (key: PersistentKeys) => {
  const value = locals[key]
  if (value === undefined) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

/**
 * sets a local variable
 */
export const setLocal = <K extends LocalKeys>(
  key: K,
  value: Locals[K] | undefined
) => {
  locals[key] = value
  if (typeSafeIncludes(persistentKeys, key)) {
    saveToLocalStorage(key)
  } else if (typeSafeIncludes(urlParameters, key)) {
    saveAllUrlParameters()
  }
}

/**
 * gets a local variable
 */
export const getLocal = <K extends LocalKeys>(
  key: K
): Locals[K] | undefined => {
  return locals[key]
}

/**
 * removes a local variable
 */
export const clearLocal = <K extends LocalKeys>(key: K) => {
  setLocal(key, undefined)
}

/**
 * === INITIALIZATION ===
 */

/**
 * initializes persistent local variables
 */
export const initLocals = () => {
  // get from local storage
  for (const key of persistentKeys) {
    const value = localStorage.getItem(key)
    if (value !== null) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        locals[key] = JSON.parse(value)
      } catch (error) {
        console.error(`Error parsing local storage key ${key}`)
        localStorage.removeItem(key)
        locals[key] = undefined
      }
    }
  }

  // get the url parameters
  const url = new URL(window.location.href)
  for (const key of urlParameters) {
    const value = url.searchParams.get(key)
    if (value !== null) {
      // @ts-expect-error typescript is doing some weird stuff here and it's not worth the effort to fix
      locals[key] =
        key === "x" || key === "z" || key === "zoom" ? Number(value) : value
    }
  }

  // check the version of local storage. If it doesn't match, clear it
  const localVersion = localStorage.getItem("version")
  if (Number(localVersion) !== version.getTime()) {
    console.info("Clearing local storage")
    localStorage.clear()
  }
  setLocal("version", version.getTime())
}

if (isBrowser()) initLocals()
