/*  no-await-in-loop */
import { saveDatabase, setupDatabase } from "./database/database"
import updateHashes from "./database/updateHashes"
import {
  beforeLocationUpdate,
  setLocation,
  afterLocationUpdate,
} from "./database/updateLocation"
import {
  afterProviderUpdate,
  beforeProviderUpdate,
  setProvider,
} from "./database/updateProvider"
import {
  afterRouteUpdate,
  beforeRouteUpdate,
  setRoute,
} from "./database/updateRoute"
import getConvertedData from "./sheets/getConvertedData"

function stupidDeepCopy<T>(obj: T): T {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(JSON.stringify(obj))
}

async function runImport() {
  const { routes, providers, locations } = await getConvertedData()
  const promises: Promise<unknown>[] = []

  const initialDatabase = stupidDeepCopy(await setupDatabase())

  /* ----------------- PROVIDERS ----------------- */

  console.log("STARTING PROVIDERS")

  beforeProviderUpdate()
  beforeProviderUpdate("transit")

  const providersToSave = [...providers]

  providersToSave.forEach(provider => setProvider(provider.uniqueId, provider))

  await Promise.allSettled(promises)
  afterProviderUpdate("transit")
  afterProviderUpdate()

  console.log("SAVED ALL PROVIDERS")

  /* ----------------- LOCATIONS ----------------- */

  console.log("STARTING LOCATIONS")

  beforeLocationUpdate()
  beforeLocationUpdate("transit")

  const locationsToSave = [...locations]

  locationsToSave.forEach(location => setLocation(location.uniqueId, location))

  await Promise.allSettled(promises)
  afterLocationUpdate("transit")
  afterLocationUpdate()

  console.log("SAVED ALL LOCATIONS")

  /* ----------------- ROUTES ----------------- */

  console.log("STARTING ROUTES")

  beforeRouteUpdate()
  beforeRouteUpdate("transit")

  const routesToSave = [...routes]

  routesToSave.forEach(route => setRoute(route.uniqueId, route))

  await Promise.all(promises)

  afterRouteUpdate("transit")
  afterRouteUpdate()

  console.log("SAVED ALL ROUTES")

  updateHashes(initialDatabase)

  console.log("UPDATED HASHES")

  await saveDatabase()

  const HEARTBEAT_ENDPOINT =
    "https://betteruptime.com/api/v1/heartbeat/WZxUmQ6m6wYxkwCSWPPz1tAD"
  await fetch(HEARTBEAT_ENDPOINT)
  console.log("Sent heartbeat")

  console.log("ALL DONE!")
}

runImport()
  .then(() => {
    console.log("Finished all operations")
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
