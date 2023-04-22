import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { get, getDatabase, ref } from "firebase/database"
import { isBrowser } from "utils/functions"
import { expose } from "utils/promise-worker"

const firebaseConfig = {
  apiKey: "AIzaSyAk72DEr-1lB3XeRWIHKQ-yq_mTytWXxoo",
  authDomain: "rapidroute-7beef.firebaseapp.com",
  databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
  projectId: "rapidroute-7beef",
  storageBucket: "rapidroute-7beef.appspot.com",
  messagingSenderId: "967487541876",
  appId: "1:967487541876:web:f987b300677d9710e5b721",
  measurementId: "G-3SEGJSYBBW",
}

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

const workerFunctions = { getData }

// Export the type for type checking
expose(workerFunctions)
type FirebaseWorkerFunctions = typeof workerFunctions
// TODO -next-line import/prefer-default-export
export type { FirebaseWorkerFunctions }
