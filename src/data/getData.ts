import { ref, onValue } from "firebase/database"

import { DatabaseType, Hashes } from "types"
import { isBrowser } from "utils/functions"

import { database } from "./firebase"

const getItem = (itemName: string) =>
  isBrowser() ? localStorage.getItem(itemName) : null
const rawcache = getItem("databaseCache")
const rawOneHash = getItem("oneHash")
const rawAllHash = getItem("allHash")

const databaseCache: DatabaseType = rawcache
  ? JSON.parse(rawcache)
  : {
      locations: {},
      pathfinding: {},
      providers: {},
      routes: {},
      searchIndex: {},
      worlds: {},
    }
const oneHashes: Hashes = rawOneHash ? JSON.parse(rawOneHash) : {}
const allHashes: Hashes = rawAllHash ? JSON.parse(rawAllHash) : {}

let databaseHashes: Hashes = {
  locations: "",
  pathfinding: "",
  providers: "",
  routes: "",
  searchIndex: "",
  worlds: "",
}
const hashesExist = new Promise(resolve => {
  onValue(ref(database, "hashes"), snapshot => {
    databaseHashes = snapshot.val()
    resolve(true)
  })
})

type GetAll<T extends keyof DatabaseType> = DatabaseType[T]
type GetOne<T extends keyof DatabaseType> = DatabaseType[T][string]

export async function getPath<T extends keyof DatabaseType>(
  type: T,
  itemName: string
): Promise<GetOne<T> | null> {
  // first get the hash from the database
  await hashesExist
  const hash = databaseHashes[type]

  // if the hash matches the one we have, return the cached value
  if (hash === oneHashes[type] && databaseCache[type][itemName]) {
    return databaseCache[type][itemName] as GetOne<T>
  }

  // otherwise, get the value from the database
  const itemRef = ref(database, `${type}/${itemName}`)
  return new Promise(resolve => {
    onValue(itemRef, lowerSnapshot => {
      if (!lowerSnapshot.exists()) return resolve(null)
      const data: GetOne<T> = lowerSnapshot.val()
      if (typeof data === "object") data.uniqueId = itemName
      databaseCache[type][itemName] = data
      oneHashes[type] = hash
      localStorage.setItem("databaseCache", JSON.stringify(databaseCache))
      localStorage.setItem("oneHash", JSON.stringify(oneHashes))
      return resolve(data)
    })
  })
}

export async function getAll<T extends keyof DatabaseType>(
  type: T
): Promise<GetAll<T>> {
  // first get the hash from the database
  await hashesExist
  const hash = databaseHashes[type]

  // if the hash matches the one we have, return the cached value
  if (hash === allHashes[type] && databaseCache[type]) {
    return databaseCache[type] as GetAll<T>
  }

  // otherwise, get the value from the database
  const itemRef = ref(database, type)
  return new Promise(resolve => {
    onValue(itemRef, lowerSnapshot => {
      const data: GetAll<T> = lowerSnapshot.val()

      // for each item, add the uniqueId
      Object.keys(data).forEach(key => {
        const item = data[key]
        if (typeof item === "object") item.uniqueId = key
      })

      databaseCache[type] = data
      allHashes[type] = hash
      oneHashes[type] = hash
      localStorage.setItem("databaseCache", JSON.stringify(databaseCache))
      localStorage.setItem("allHash", JSON.stringify(allHashes))
      localStorage.setItem("oneHash", JSON.stringify(oneHashes))
      return resolve(data)
    })
  })
}
