import {
  DatabaseType,
  isWholeDatabase,
  validateDatabase,
} from "@rapidroute/database-types"
import { config } from "dotenv"
import admin, { ServiceAccount } from "firebase-admin"

// import accountKeyRAW from "../serviceAccountKey.json"
import makeSafeForDatabase, { isObject } from "./makeSafeForDatabase"
import { DeepRemoveUniqueId, removeUniqueId } from "./removeUniqueId"

config()

const accountKey: ServiceAccount = {
  clientEmail: process.env.CLIENT_EMAIL ?? "",
  privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n") ?? "",
  projectId: process.env.PROJECT_ID ?? "",
}

admin.initializeApp({
  credential: admin.credential.cert(accountKey),
  databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
})

const rawDatabase = admin.database()
export const database: DeepRemoveUniqueId<Partial<DatabaseType>> = {}

// we do the database all in one go to reduce usage and increase speed
export const setupDatabase = async () => {
  console.log("Setting up database...")
  const snapshot = await rawDatabase.ref("/").once("value")
  const data: unknown = snapshot.val() ?? {}

  // re-add unique ids that don't exist in the database
  if (isObject(data)) {
    Object.values(data).forEach(type => {
      if (isObject(type)) {
        Object.entries(type).forEach(entry => {
          const [key, value] = entry
          if (isObject(value)) {
            value.uniqueId = key
          }
        })
      }
    })
  }

  console.log(validateDatabase(data))
  if (!isWholeDatabase(data)) throw new Error("Database is not valid")

  Object.assign(database, data)
  const tempOut: typeof data = {
    hashes: {
      locations: "",
      providers: "",
      pathfinding: "",
      routes: "",
      searchIndex: "",
    },
    routes: {},
    locations: {},
    pathfinding: {},
    providers: {},
    searchIndex: {},
  }
  return tempOut
}

export const saveDatabase = async () => {
  await rawDatabase.ref("/").set(makeSafeForDatabase(removeUniqueId(database)))
}
