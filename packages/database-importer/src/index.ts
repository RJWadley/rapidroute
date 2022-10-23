/* eslint-disable no-await-in-loop */
import throttledMap from "./database/throttledMap"
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
  disconnectRoutesListeners,
  setRoute,
} from "./database/updateRoute"
import getConvertedData from "./sheets/getConvertedData"

async function runImport() {
  const { routes, providers, locations } = await getConvertedData()
  // saveDataToFirebase(oldData.routes, oldData.locations, oldData.providers)
  const promises: Promise<unknown>[] = []

  /* ----------------- PROVIDERS ----------------- */

  console.log("STARTING PROVIDERS")

  await beforeProviderUpdate()
  await beforeProviderUpdate("transit")

  const providersToSave = [...providers]

  await throttledMap(providersToSave, provider =>
    setProvider(provider.uniqueId, provider)
  )

  await Promise.allSettled(promises)
  await afterProviderUpdate("transit")
  await afterProviderUpdate()

  console.log("SAVED ALL PROVIDERS")

  /* ----------------- LOCATIONS ----------------- */

  console.log("STARTING LOCATIONS")

  await beforeLocationUpdate()
  await beforeLocationUpdate("transit")

  const locationsToSave = [...locations]

  await throttledMap(locationsToSave, location =>
    setLocation(location.uniqueId, location)
  )

  await Promise.allSettled(promises)
  await afterLocationUpdate("transit")
  await afterLocationUpdate()

  console.log("SAVED ALL LOCATIONS")

  /* ----------------- ROUTES ----------------- */

  console.log("STARTING ROUTES")

  await beforeRouteUpdate()
  await beforeRouteUpdate("transit")

  const routesToSave = [...routes]

  await throttledMap(routesToSave, route => setRoute(route.uniqueId, route))

  await Promise.all(promises)

  await afterRouteUpdate("transit")
  await afterRouteUpdate()

  console.log("SAVED ALL ROUTES")

  await updateHashes()

  console.log("UPDATED HASHES")

  disconnectRoutesListeners()
  console.log("ALL DONE!")
}

runImport().then(() => {
  console.log("Finished all operations")
  process.exit(0)
})
