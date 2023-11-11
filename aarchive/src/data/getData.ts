import {
  DatabaseDataKeys,
  databaseTypeGuards,
  DataDatabaseType,
  Hashes,
  Place,
} from "@rapidroute/database-utils"
import { wrap } from "comlink"
import { setShowOfflineBanner } from "components/OfflineBanner"
import { isBrowser, sleep } from "utils/functions"
import isObject from "utils/isObject"
import { getLocal, setLocal } from "utils/localUtils"

import { FirebaseWorkerType } from "./firebase"
import isCoordinate from "./isCoordinate"

const defaultDatabaseCache: DataDatabaseType = {
  places: {},
  pathfinding: {},
  providers: {},
  routes: {},
  searchIndex: {},
}
const defaultHashes: Hashes = {
  places: undefined,
  pathfinding: undefined,
  providers: undefined,
  routes: undefined,
  searchIndex: undefined,
}
const databaseCache = getLocal("databaseCache") ?? defaultDatabaseCache
const oneHashes = getLocal("oneHash") ?? defaultHashes
const allHashes = getLocal("allHash") ?? defaultHashes

const guardFailed = (...args: unknown[]) => {
  console.warn("guard failed", ...args)
}

const getData = (() => {
  if (!isBrowser()) return
  const worker = new Worker(new URL("firebase.ts", import.meta.url))
  return wrap<FirebaseWorkerType>(worker)
})()

let databaseHashes: Hashes = {
  places: "",
  pathfinding: "",
  providers: "",
  routes: "",
  searchIndex: "",
}

const hashesExist = (async () => {
  const rawValue = await getData?.("hashes")
  if (isObject(rawValue)) {
    databaseHashes = { ...defaultHashes, ...rawValue }
    return true
  }
  return false
})()

type GetAll<T extends DatabaseDataKeys> = NonNullable<DataDatabaseType[T]>
type GetOne<T extends DatabaseDataKeys> = NonNullable<
  DataDatabaseType[T]
>[string]

async function getPathFromDatabase<T extends DatabaseDataKeys>(
  type: T,
  itemName: string
): Promise<GetOne<T> | null> {
  const dataIn = await getData?.(`${type}/${itemName}`)
  const data = isObject(dataIn) ? { ...dataIn, uniqueId: itemName } : dataIn
  if (!databaseTypeGuards[type](data)) {
    guardFailed(type, data)
    return null
  }
  databaseCache[type] = {
    ...databaseCache[type],
    [itemName]: data,
  }
  return data
}

async function getAllFromDatabase<T extends DatabaseDataKeys>(
  type: T
): Promise<GetAll<T>> {
  console.info("getAllFromDatabase", type)
  const rawData = await getData?.(type)
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
        guardFailed(type, item)
      }
    })
  }

  return data
}

const fetchingPaths: string[] = []

export async function getPath<T extends DatabaseDataKeys>(
  type: T,
  itemName: string
): Promise<GetOne<T> | null> {
  while (fetchingPaths.includes(`${type}/${itemName}`)) {
    await sleep(250)
  }
  const timeout = setTimeout(() => {
    setShowOfflineBanner(true)
  }, 10_000)
  fetchingPaths.push(`${type}/${itemName}`)
  const done = () => {
    fetchingPaths.splice(fetchingPaths.indexOf(`${type}/${itemName}`), 1)
    clearTimeout(timeout)
  }

  // some things are not in the database, so we need to check for that
  if (type === "places" && isCoordinate(itemName)) {
    const xCoord = parseInt(itemName.split(", ")[0]?.split(": ")[1] ?? "0", 10)
    const zCoord = parseInt(itemName.split(", ")[1] ?? "0", 10)
    const out: Place = {
      uniqueId: itemName,
      name: itemName,
      shortName: `${xCoord}, ${zCoord}`,
      type: "Coordinate",
      world: "New",
      enabled: true,
      isSpawnWarp: false,
      coords: {
        x: xCoord,
        z: zCoord,
      },
    }
    if (databaseTypeGuards[type](out)) {
      done()
      return out
    }
  }
  if (type === "places" && itemName === "Current Location") {
    const out: Place = {
      uniqueId: itemName,
      name: itemName,
      shortName: "Location",
      type: "Coordinate",
      world: "New",
      enabled: true,
      isSpawnWarp: false,
    }
    if (databaseTypeGuards[type](out)) {
      done()
      return out
    }
  }

  // first get the hash from the database
  await hashesExist
  const typeHash = databaseHashes[type]

  // if the hash matches the one we have, return the cached value
  if (typeHash === oneHashes[type] && databaseCache[type]?.[itemName]) {
    console.info("cache hit", type, itemName)
    const output = databaseCache[type]?.[itemName]
    if (databaseTypeGuards[type](output)) {
      done()
      return output
    }
    console.info("guard failed", type, output)
  }

  if (typeHash === oneHashes[type]) {
    console.info("cache miss", type, itemName)
  } else {
    console.info("hash mismatch", type, itemName)

    // clear the cache
    databaseCache[type] = {}
  }

  const path = await getPathFromDatabase(type, itemName)
  oneHashes[type] = typeHash
  setLocal("databaseCache", databaseCache)
  setLocal("oneHash", oneHashes)
  done()
  return path
}

export async function getAll<T extends DatabaseDataKeys>(
  type: T
): Promise<GetAll<T>> {
  while (fetchingPaths.includes(type)) {
    await sleep(250)
  }
  fetchingPaths.push(type)
  const timeout = setTimeout(() => {
    setShowOfflineBanner(true)
  }, 10_000)
  const done = () => {
    fetchingPaths.splice(fetchingPaths.indexOf(type), 1)
    clearTimeout(timeout)
  }

  console.info("getAll", type)
  // first get the hash from the database
  await hashesExist
  const typeHash = databaseHashes[type]

  // if the hash matches the one we have, return the cached value
  if (typeHash === allHashes[type] && databaseCache[type]) {
    console.info("cache hit", type)
    const output: GetAll<T> = databaseCache[type] ?? {}

    // check for values that don't match the type guard
    Object.keys(output).forEach(key => {
      if (!databaseTypeGuards[type](output[key])) {
        guardFailed(type, output[key])
        databaseCache[type] = undefined
      }
    })
    done()
    return output
  }

  if (typeHash === allHashes[type]) {
    console.info("cache miss", type)
  } else {
    console.info("hash mismatch", type)

    // clear the cache
    databaseCache[type] = {}
  }

  const data = await getAllFromDatabase(type)
  databaseCache[type] = data
  allHashes[type] = typeHash
  oneHashes[type] = typeHash
  setLocal("databaseCache", databaseCache)
  setLocal("allHash", allHashes)
  setLocal("oneHash", oneHashes)
  done()
  return data
}
