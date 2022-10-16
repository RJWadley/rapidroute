import { DatabaseType, Hashes } from "@rapidroute/database-types"

import { isBrowser } from "./functions"

const latestVersion = 20221015

/**
 * return types from local storage
 */
interface LocalStorage {
  /**
   * cache for the database
   */
  databaseCache: DatabaseType
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
  return JSON.parse(value)
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
  lastMapInteraction?: Date
  /**
   * player to follow on map
   */
  following?: string
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
  lastKnownLocation?: {
    x: number
    z: number
  }
}

export const session: Session = {
  isDebug: false,
}
