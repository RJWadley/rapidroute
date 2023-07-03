import { expose } from "comlink"
import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { get, getDatabase, ref } from "firebase/database"
import { isBrowser } from "utils/functions"

import devConfig from "./firebase.dev.json"
import prodConfig from "./firebase.prod.json"

const firebaseConfig =
  process.env.NODE_ENV === "production" ? prodConfig : devConfig
const environment = process.env.NODE_ENV === "production" ? "prod" : "dev"
console.info(`Using ${environment} firebase config`)

export const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)
export const analytics = isBrowser() && getAnalytics(app)

let timeout: NodeJS.Timeout | undefined
const allResolves: (() => void)[] = []

/**
 * returns a promise that will resolve when the database is done fetching data
 */
const batch = () => {
  if (timeout) clearTimeout(timeout)
  return new Promise<void>(resolve => {
    allResolves.push(resolve)
    timeout = setTimeout(() => {
      allResolves.forEach(r => r())
      allResolves.length = 0
    }, 750)
  })
}

const getData = async (path: string): Promise<unknown> => {
  const snapshot = await get(ref(database, path))
  const value: unknown = snapshot.val()

  await batch()
  return value
}

// Export the type for type checking
expose(getData)
export type FirebaseWorkerType = typeof getData
