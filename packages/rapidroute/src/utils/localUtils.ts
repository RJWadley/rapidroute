import { DataDatabaseType, Hashes } from "@rapidroute/database-types"

import { isBrowser } from "./functions"

const latestVersion = 20221015

/**
 * return types from local storage
 */
interface LocalStorage {
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
}

export const setLocal = <T extends keyof LocalStorage>(
  key: T,
  value: LocalStorage[T]
) => {
  if (!isBrowser()) return
  localStorage.setItem(key, JSON.stringify(value))
}

export const getLocal = <T extends keyof LocalStorage>(
  key: T
): LocalStorage[T] | null => {
  if (!isBrowser()) return null
  const value = localStorage.getItem(key)
  if (value === null) {
    return null
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return JSON.parse(value) as LocalStorage[T]
}

export const clearLocal = <T extends keyof LocalStorage>(key: T) => {
  if (!isBrowser()) return
  localStorage.removeItem(key)
}

const version = getLocal("version")
if (isBrowser())
  if (!version || version < latestVersion) {
    localStorage.clear()
    setLocal("version", latestVersion)
  }

export interface Session {
  /**
   * true if should show debugging information
   */
  isDebug: boolean
  /**
   * date of last pan or zoom on map
   */
  lastMapInteraction: Date
  /**
   * player to follow on map
   */
  following: string
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
}

export const session: Partial<Session> = {
  isDebug: false,
}

if (isBrowser()) {
  window.session = session
}
