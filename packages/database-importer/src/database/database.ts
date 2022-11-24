import {
  DatabaseType,
  isPartialWholeDatabase,
  validateDatabase,
} from "@rapidroute/database-types"
import admin, { ServiceAccount } from "firebase-admin"

import accountKeyRAW from "../serviceAccountKey.json"
import { isObject } from "./makeSafeForDatabase"

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
let database: Partial<DatabaseType> = {}

export const setupDatabase = async () => {
  console.log("Setting up database...")
  const snapshot = await rawDatabase.ref("/").once("value")
  const data: unknown = snapshot.val() ?? {}

  console.log(validateDatabase(data))
  if (!isPartialWholeDatabase(data)) throw new Error("Database is not valid")

  database = data
  return database
}

export const read = (path: string) => {
  // split path into parts
  const parts = path.split("/").filter(part => part !== "")

  // get the value from the database
  let value: unknown = database
  for (let i = 0; i < parts.length; i += 1) {
    if (isObject(value)) {
      value = value[parts[i]]
    } else {
      return undefined
    }
  }

  return value
}

const subscriptionCallbacks: (() => void)[] = []
export const subscribe = (callback: () => void) => {
  callback()
  subscriptionCallbacks.push(callback)
}

export const write = async (path: string, data: unknown) => {
  await rawDatabase.ref(path).set(data)

  // update the local database
  const parts = path.split("/").filter(part => part !== "")
  let value: unknown = database
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (isObject(value)) {
      value = value[parts[i]]
    } else {
      throw new Error("Invalid path")
    }
  }

  if (isObject(value)) {
    value[parts[parts.length - 1]] = data
  }

  // call all the callbacks
  subscriptionCallbacks.forEach(callback => callback())
}

export const update = async (path: string, data: object) => {
  await rawDatabase.ref(path).update(data)

  // update the local database
  const parts = path.split("/").filter(part => part !== "")
  let value: unknown = database
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (isObject(value)) {
      value = value[parts[i]]
    } else {
      throw new Error("Invalid path")
    }
  }

  if (isObject(value)) {
    const previousData = value[parts[parts.length - 1]]
    if (isObject(previousData)) {
      value[parts[parts.length - 1]] = {
        ...previousData,
        ...data,
      }
    }
  }

  // call all the callbacks
  subscriptionCallbacks.forEach(callback => callback())
}

export const remove = async (path: string) => {
  await rawDatabase.ref(path).remove()

  // update the local database
  const parts = path.split("/").filter(part => part !== "")
  let value: unknown = database
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (isObject(value)) {
      value = value[parts[i]]
    } else {
      throw new Error("Invalid path")
    }
  }

  if (isObject(value)) {
    delete value[parts[parts.length - 1]]
  }

  // call all the callbacks
  subscriptionCallbacks.forEach(callback => callback())
}

export const saveDatabase = async () => {
  await rawDatabase.ref("/").set(database)
}
