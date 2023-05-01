import { saveDatabase, setupDatabase, versionCheck } from "./database/database"
import updateHashes from "./database/updateHashes"
import {
  afterLocationUpdate,
  beforeLocationUpdate,
  updatePlace,
} from "./database/updatePlace"
import {
  afterProviderUpdate,
  beforeProviderUpdate,
  updateProvider,
} from "./database/updateProvider"
import {
  afterRouteUpdate,
  beforeRouteUpdate,
  updateRoute,
} from "./database/updateRoute"
import getConvertedData from "./sheets/getConvertedData"

function stupidDeepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

async function runImport() {
  await versionCheck()

  const { routes, providers, locations } = await getConvertedData()
  const promises: Promise<unknown>[] = []

  const initialDatabase = stupidDeepCopy(await setupDatabase())

  /* ----------------- PROVIDERS ----------------- */

  console.info("STARTING PROVIDERS")

  beforeProviderUpdate()

  const providersToSave = [...providers]
  providersToSave.forEach(provider => updateProvider(provider))

  afterProviderUpdate()

  console.info("SAVED ALL PROVIDERS")

  /* ----------------- LOCATIONS ----------------- */

  console.info("STARTING LOCATIONS")

  beforeLocationUpdate()

  const locationsToSave = [...locations]

  locationsToSave.forEach(location => updatePlace(location))

  await Promise.allSettled(promises)
  afterLocationUpdate()

  console.info("SAVED ALL LOCATIONS")

  /* ----------------- ROUTES ----------------- */

  console.info("STARTING ROUTES")

  beforeRouteUpdate()

  const routesToSave = [...routes]

  routesToSave.forEach(route => updateRoute(route))

  await Promise.all(promises)

  afterRouteUpdate()

  console.info("SAVED ALL ROUTES")

  updateHashes(initialDatabase)

  console.info("UPDATED HASHES")

  await saveDatabase()

  console.info("ALL DONE!")
}

runImport()
  .then(() => {
    console.info("Finished all operations")
    return process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
