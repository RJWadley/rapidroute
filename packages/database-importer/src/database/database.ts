import admin, { ServiceAccount } from "firebase-admin"

import accountKeyRAW from "../serviceAccountKey.json"

const accountKey: ServiceAccount = {
  clientEmail: accountKeyRAW.client_email,
  privateKey: accountKeyRAW.private_key,
  projectId: accountKeyRAW.project_id,
}

admin.initializeApp({
  credential: admin.credential.cert(accountKey),
  databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
})

const database = admin.database()

export const read = async (path: string) => {
  const snapshot = await database.ref(path).once("value")
  const out: unknown = snapshot.val()
  return out
}

export const subscribe = (path: string, callback: (data: unknown) => void) => {
  database.ref(path).on("value", snapshot => {
    const data: unknown = snapshot.val()
    callback(data)
  })
}

export const write = async (path: string, data: unknown) => {
  return database.ref(path).set(data)
}

export const update = async (path: string, data: object) => {
  return database.ref(path).update(data)
}

export const remove = async (path: string) => {
  return database.ref(path).remove()
}
