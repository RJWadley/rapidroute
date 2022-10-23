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
export default database
