import { DatabaseType, Hashes } from "@rapidroute/database-types"

import { isBrowser } from "./functions"

const lastBreakingUpdate = 20221015

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
  selectedPlayer: string
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
  if (!isBrowser) return null
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

if ((getLocal("version") || -1) < lastBreakingUpdate) {
  localStorage.clear()
  setLocal("version", lastBreakingUpdate)
}
