import fs from "node:fs"
import path from "node:path"

import {
  DatabaseType,
  isRecord,
  isWholeDatabase,
  makeSafeForDatabase,
  setConfig,
  validateDatabase,
} from "@rapidroute/database-utils"
import { config } from "dotenv"
import admin, { ServiceAccount } from "firebase-admin"

import { DeepRemoveUniqueId, removeUniqueId } from "./removeUniqueId"

config()

const accountKey: ServiceAccount = {
  clientEmail: process.env.CLIENT_EMAIL ?? "",
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
  projectId: process.env.PROJECT_ID ?? "",
}

admin.initializeApp({
  credential: admin.credential.cert(accountKey),
  databaseURL:
    process.env.DATABASE_URL ??
    "https://rapidroute-7beef-default-rtdb.firebaseio.com",
})

const rawDatabase = admin.database()
export const database: DeepRemoveUniqueId<Partial<DatabaseType>> = {}

// we do the database all in one go to reduce usage and increase speed
export const setupDatabase = async () => {
  console.info("Setting up database...")
  const snapshot = await rawDatabase.ref("/").once("value")
  const data: unknown = snapshot.val() ?? {}

  // re-add unique ids that don't exist in the database
  if (isRecord(data)) {
    Object.values(data).forEach(type => {
      if (isRecord(type)) {
        Object.entries(type).forEach(entry => {
          const [key, value] = entry
          if (isRecord(value)) {
            value.uniqueId = key
          }
        })
      }
    })
  }

  if (!isWholeDatabase(data)) {
    validateDatabase(data)
    throw new Error("Database is not valid")
  }
  Object.assign(database, data)

  const utilConfig = {
    /**
     * read a value from the database
     * @param key the key to read, separated by /
     * @returns the value at the key
     */
    getItem: (key: string) => {
      const stops = key.split("/")
      const lastStop = stops.pop()

      let currentStop: unknown = database
      for (const stop of stops) {
        currentStop ||= {}
        if (isRecord(currentStop) && stop in currentStop) {
          currentStop = currentStop[stop]
        }
      }

      if (lastStop && isRecord(currentStop)) return currentStop[lastStop]
    },
    /**
     * sets a value in the database
     * @param key the key to set, separated by /
     * @param value the value to set at that location
     */
    setItem: (key: string, value: unknown) => {
      const stops = key.split("/")
      const lastStop = stops.pop()

      let currentStop: unknown = database
      for (const stop of stops) {
        currentStop ||= {}
        if (isRecord(currentStop) && stop in currentStop) {
          currentStop = currentStop[stop]
        }
      }

      if (lastStop && isRecord(currentStop)) currentStop[lastStop] = value
      else if (lastStop) throw new Error("Failed to set key: " + key)
    },
    removeItem: (key: string) => {
      utilConfig.setItem(key, undefined)
    },
  }

  setConfig(utilConfig)

  return database
}

export const saveDatabase = async () => {
  await rawDatabase.ref("/").set(makeSafeForDatabase(removeUniqueId(database)))

  writeDatabaseToDisk()
}

const clearDatabase = async () => {
  return rawDatabase.ref("/").set(null)
}

// if the --clearDatabase flag is passed, clear the database
if (process.argv.includes("--clearDatabase")) {
  clearDatabase()
    .then(() => {
      console.info("Database cleared")
      return process.exit(0)
    })
    .catch(console.error)
}

const currentVersion = "2023-04-27"

/**
 * check the version of the database,
 * and if it's not the latest, clear it
 */
export const versionCheck = async () => {
  const snapshot = await rawDatabase.ref("/version").once("value")
  const version: unknown = snapshot.val()

  if (version !== currentVersion) {
    console.info("Version mismatch, clearing database")
    await clearDatabase()
    Object.assign(database, {})
    await rawDatabase.ref("/version").set(currentVersion)
  }
}

/**
 * saves the database in a JSON file at database.json in the base of the repository
 */
const writeDatabaseToDisk = () => {
  const filteredDatabase = makeSafeForDatabase(removeUniqueId(database))
  const databasePath = path.join(__dirname, "..", "..", "..", "database.json")
  fs.writeFileSync(databasePath, JSON.stringify(filteredDatabase, null, 2))
  console.info("Database written to disk")
}
