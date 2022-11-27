import {
  DatabaseType,
  isWholeDatabase,
  validateDatabase,
} from "@rapidroute/database-types"
import admin, { ServiceAccount } from "firebase-admin"

import accountKeyRAW from "../serviceAccountKey.json"
import makeSafeForDatabase from "./makeSafeForDatabase"
import { DeepRemoveUniqueId, removeUniqueId } from "./removeUniqueId"

const accountKey: ServiceAccount = {
  clientEmail: accountKeyRAW.client_email,
  privateKey: accountKeyRAW.private_key,
  projectId: accountKeyRAW.project_id,
}

admin.initializeApp({
  credential: admin.credential.cert(accountKey),
  databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
})

const rawDatabase = admin.database()
export const database: DeepRemoveUniqueId<Partial<DatabaseType>> = {}

export const setupDatabase = async () => {
  console.log("Setting up database...")
  const snapshot = await rawDatabase.ref("/").once("value")
  const data: unknown = snapshot.val() ?? {}

  console.log(validateDatabase(data))
  if (!isWholeDatabase(data)) throw new Error("Database is not valid")

  Object.assign(database, data)
  return database
}

export const saveDatabase = async () => {
  await rawDatabase.ref("/").set(makeSafeForDatabase(removeUniqueId(database)))
}
