/*  eslint-disable no-console */
import {
  DatabaseType,
  Hashes,
  databaseTypeGuards,
  Location,
} from "@rapidroute/database-types"
import { ref, onValue } from "firebase/database"
import { throttle } from "pathfinding/findPath/pathUtil"
import isObject from "utils/isObject"
import { getLocal, setLocal } from "utils/localUtils"

import { database } from "./firebase"
import isCoordinate from "./isCoordinate"

const defaultDatabaseCache: DatabaseType = {
  locations: {},
  pathfinding: {},
  providers: {},
  routes: {},
  searchIndex: {},
  worlds: {},
}
const defaultHashes: Hashes = {
  locations: undefined,
  pathfinding: undefined,
  providers: undefined,
  routes: undefined,
  searchIndex: undefined,
  worlds: undefined,
}
const databaseCache = getLocal("databaseCache") ?? defaultDatabaseCache
const oneHashes = getLocal("oneHash") ?? defaultHashes
const allHashes = getLocal("allHash") ?? defaultHashes

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
    // databaseHashes = snapshot.val()
    const rawValue: unknown = snapshot.val()
    if (isObject(rawValue)) {
      databaseHashes = rawValue
    }
    resolve(true)
  })
})

type GetAll<T extends keyof DatabaseType> = DatabaseType[T]
type GetOne<T extends keyof DatabaseType> = DatabaseType[T][string]

export async function getPath<T extends keyof DatabaseType>(
  type: T,
  itemName: string
): Promise<GetOne<T> | null> {
  // some things are not in the database, so we need to check for that
  if (type === "locations" && isCoordinate(itemName)) {
    const xCoord = parseInt(itemName.split(", ")[0].split(": ")[1], 10)
    const zCoord = parseInt(itemName.split(", ")[1], 10)
    const out: Location = {
      uniqueId: itemName,
      name: itemName,
      shortName: `${xCoord}, ${zCoord}`,
      autoGenerated: true,
      type: "Coordinate",
      world: "New",
      enabled: true,
      isSpawnWarp: false,
      location: {
        x: xCoord,
        z: zCoord,
      },
    }
    if (databaseTypeGuards[type](out)) return out
  }

  // first get the hash from the database
  await hashesExist
  const hash = databaseHashes[type]

  // if the hash matches the one we have, return the cached value
  if (hash === oneHashes[type] && databaseCache[type][itemName]) {
    console.log("cache hit", type, itemName)
    const output = databaseCache[type][itemName]
    if (databaseTypeGuards[type](output)) return output
    console.log("guard failed", type, output)
  }
  if (hash !== oneHashes[type]) {
    console.log("hash mismatch", type, itemName)

    // clear the cache
    databaseCache[type] = {}
  } else {
    console.log("cache miss", type, itemName)
  }

  // otherwise, get the value from the database
  const itemRef = ref(database, `${type}/${itemName}`)
  return new Promise(resolve => {
    onValue(itemRef, async lowerSnapshot => {
      if (!lowerSnapshot.exists()) return resolve(null)
      const data: unknown = lowerSnapshot.val()
      if (isObject(data)) data.uniqueId = itemName
      if (!databaseTypeGuards[type](data)) {
        console.log("guard failed", type, data)
        return resolve(null)
      }
      databaseCache[type][itemName] = data
      oneHashes[type] = hash
      setLocal("databaseCache", databaseCache)
      setLocal("oneHash", oneHashes)
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
    console.log("cache hit", type)
    const output = databaseCache[type]

    // filter out values that don't match the type guard
    Object.keys(output).forEach(key => {
      if (!databaseTypeGuards[type](output[key])) {
        console.log("guard failed", type, output[key])
        delete output[key]
      }
    })
    return output
  }
  if (hash !== allHashes[type]) {
    console.log("hash mismatch", type)

    // clear the cache
    databaseCache[type] = {}
  } else {
    console.log("cache miss", type)
  }

  // otherwise, get the value from the database
  const itemRef = ref(database, type)
  return new Promise(resolve => {
    onValue(itemRef, async lowerSnapshot => {
      await throttle()
      const rawData: unknown = lowerSnapshot.val()
      const data: GetAll<T> = {}

      if (isObject(rawData)) {
        // for each item, add the uniqueId
        Object.keys(rawData).forEach(key => {
          const item = rawData[key]
          if (isObject(item)) item.uniqueId = key
        })

        // filter out values that don't match the type guard
        Object.entries(rawData).forEach(([key, item]) => {
          // if key is a symbol, it's not a valid key
          if (typeof key === "symbol") return

          if (databaseTypeGuards[type](item)) {
            data[key] = item
          } else {
            console.log("guard failed", type, item)
          }
        })
      }

      databaseCache[type] = data
      allHashes[type] = hash
      oneHashes[type] = hash
      setLocal("databaseCache", databaseCache)
      setLocal("allHash", allHashes)
      setLocal("oneHash", oneHashes)
      return resolve(data)
    })
  })
}
