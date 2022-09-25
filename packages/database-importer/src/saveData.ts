/* eslint-disable no-console */
import {
  Location,
  Locations,
  Provider,
  Providers,
  Route,
  Routes,
  SearchIndex,
  reverseShortHandMap,
} from "@rapidroute/database-utils"
import admin, { ServiceAccount } from "firebase-admin"

import makeSafeForDatabase from "./makeSafeForDatabase"
import accountKey from "./serviceAccountKey.json"

export default async function saveDataToFirebase(
  routesToSave: Route[],
  locationsToSave: Location[],
  providersToSave: Provider[]
) {
  admin.initializeApp({
    credential: admin.credential.cert(accountKey as ServiceAccount),
    databaseURL: "https://rapidroute-7beef-default-rtdb.firebaseio.com",
  })

  const database = admin.database()

  /* ------------------ PROVIDERS ------------------ */

  const updateProvider = (provider: Provider) => {
    const providerLessId: Partial<Provider> = { ...provider }
    delete providerLessId.uniqueId
    database
      .ref(`providers/${provider.uniqueId}`)
      .set(makeSafeForDatabase(providerLessId))
      .then(() => {
        console.log(`Saved provider ${provider.uniqueId}`)
      })
  }

  const deleteProvider = (providerId: string) => {
    database
      .ref(`providers/${providerId}`)
      .remove()
      .then(() => {
        console.log(`Deleted provider ${providerId}`)
      })
  }

  const saveProviders = async () => {
    // get from database
    const providersRef = database.ref("providers")
    const providersSnapshot = await providersRef.get()
    const providersFromDatabase: Providers = providersSnapshot.val() || {}

    // go through existing and overwrite if necessary
    Object.keys(providersFromDatabase).forEach(providerKey => {
      const newValue = providersToSave.find(x => x.uniqueId === providerKey)

      if (providersFromDatabase[providerKey].autoGenerated) {
        if (newValue) updateProvider(newValue)
        else deleteProvider(providerKey)
      }
    })

    // go through new and add if necessary
    providersToSave.forEach(provider => {
      if (!providersFromDatabase[provider.uniqueId]) {
        updateProvider(provider)
      }
    })
  }

  /* ------------------ LOCATIONS ------------------ */

  const updateLocation = (location: Location) => {
    const locationLessId: Partial<Location> = { ...location }
    delete locationLessId.uniqueId
    database
      .ref(`locations/${location.uniqueId}`)
      .set(makeSafeForDatabase(locationLessId))
      .then(() => console.log(`Location saved: ${location.uniqueId}`))

    /* update this locations search index */
    const searchIndex: Omit<SearchIndex[string], "uniqueId"> = {
      d: `${location.shortName} - ${location.name}`,
      i: `${location.name} ${location.shortName} ${
        location.ownerPlayer instanceof Array
          ? location.ownerPlayer.join(" ")
          : location.ownerPlayer ?? ""
      } ${location.keywords ?? ""}`,
    }
    database
      .ref(`searchIndex/${location.uniqueId}`)
      .set(makeSafeForDatabase(searchIndex))
      .then(() =>
        console.log(`Search index updated for location: ${location.uniqueId}`)
      )

    /* update this locations pathfinding index */
    database
      .ref(`pathfinding/${location.uniqueId}`)
      .update({
        x: location.location?.x || null,
        z: location.location?.z || null,
        w: location.isSpawnWarp || null,
      })
      .then(() =>
        console.log(
          `Pathfinding index updated for location: ${location.uniqueId}`
        )
      )
  }

  const deleteLocation = (locationId: string) => {
    database
      .ref(`locations/${locationId}`)
      .remove()
      .then(() => console.log("deleted location", locationId))
    database
      .ref(`searchIndex/${locationId}`)
      .remove()
      .then(() => console.log("deleted search index for location", locationId))
    database
      .ref(`pathfinding/${locationId}`)
      .remove()
      .then(() =>
        console.log("deleted pathfinding index for location", locationId)
      )
  }

  const saveLocations = async () => {
    // get from database
    const locationsRef = database.ref("locations")
    const locationsSnapshot = await locationsRef.get()
    const locationsFromDatabase: Locations = locationsSnapshot.val() || {}

    // go through existing and overwrite if necessary
    Object.keys(locationsFromDatabase).forEach(locationKey => {
      const newValue = locationsToSave.find(x => x.uniqueId === locationKey)

      if (locationsFromDatabase[locationKey].autoGenerated) {
        if (newValue) updateLocation(newValue)
        else deleteLocation(locationKey)
      }
    })

    // go through new and add if necessary
    locationsToSave.forEach(location => {
      if (!locationsFromDatabase[location.uniqueId]) {
        updateLocation(location)
      }
    })
  }

  /* ------------------ ROUTES ------------------ */

  const updateRoute = async (route: Route) => {
    const routeId: string = route.uniqueId
    const routeLessId: Partial<Route> = { ...route }
    delete routeLessId.uniqueId

    const oldRoute = await database
      .ref(`routes/${routeId}`)
      .get()
      .then(snapshot => snapshot.val() as Route | null)

    if (!oldRoute) {
      database
        .ref(`routes/${routeId}`)
        .set(makeSafeForDatabase(routeLessId))
        .then(() => console.log(`Route saved: ${routeId}`))
    } else {
      const newLocations = Object.keys(route.locations)
      const oldLocations = Object.keys(oldRoute.locations).filter(
        x => !newLocations.includes(x)
      )
      const allLocations = [...newLocations, ...oldLocations]

      newLocations.forEach(locationId => {
        // get this locations routes, add this location, and save
        database
          .ref(`pathfinding/${locationId}/${reverseShortHandMap[route.type]}`)
          .get()
          .then(
            snapshot =>
              (snapshot.val() || {}) as Record<
                string,
                { n: string; g: number | null }[]
              >
          )
          .then(origLocationPlaces => {
            newLocations.forEach(destinationLocationId => {
              if (destinationLocationId === locationId) return

              const routeIds = origLocationPlaces[destinationLocationId] || []
              if (routeIds.some(x => x.n === routeId)) return

              routeIds.push({ n: routeId, g: route.numGates ?? null })
              database
                .ref(
                  `pathfinding/${locationId}/${reverseShortHandMap[route.type]}`
                )
                .update(
                  makeSafeForDatabase({ [destinationLocationId]: routeIds })
                )
                .then(() =>
                  console.log(`Route added to location: ${locationId}`)
                )
            })
          })
      })

      oldLocations.forEach(locationId => {
        // get this locations routes, remove this location, and save
        database
          .ref(`pathfinding/${locationId}/${reverseShortHandMap[route.type]}`)
          .get()
          .then(
            snapshot =>
              (snapshot.val() || {}) as Record<
                string,
                { n: string; g: number | null }[]
              >
          )
          .then(origLocationPlaces => {
            allLocations.forEach(destinationLocationId => {
              if (destinationLocationId === locationId) return

              let routeIds = origLocationPlaces[destinationLocationId] || []
              if (!routeIds.filter(x => x.n === routeId).length) return

              routeIds = routeIds.filter(x => x.n !== routeId)
              database
                .ref(
                  `pathfinding/${locationId}/${reverseShortHandMap[route.type]}`
                )
                .update(
                  makeSafeForDatabase({ [destinationLocationId]: routeIds })
                )
                .then(() =>
                  console.log(`Route removed from location: ${locationId}`)
                )
            })
          })
      })
    }
  }

  const deleteRoute = async (routeId: string, route: Route) => {
    const oldRoute = await database
      .ref(`routes/${routeId}`)
      .get()
      .then(x => x.val() as Route | null)
    database
      .ref(`routes/${routeId}`)
      .remove()
      .then(() => {
        console.log(`Route deleted: ${routeId}`)
      })

    if (oldRoute) {
      Object.keys(oldRoute.locations).forEach(locationId => {
        database
          .ref(`pathfinding/${locationId}/${reverseShortHandMap[route.type]}`)
          .get()
          .then(
            snapshot =>
              (snapshot.val() || {}) as Record<
                string,
                { n: string; g: number | null }[]
              >
          )
          .then(origLocationPlaces => {
            if (oldRoute)
              Object.keys(oldRoute.locations).forEach(destinationLocationId => {
                if (destinationLocationId === locationId) return

                let routeIds = origLocationPlaces[destinationLocationId] || []
                if (!routeIds.filter(x => x.n === routeId).length) return

                routeIds = routeIds.filter(x => x.n !== route.uniqueId)
                database
                  .ref(
                    `pathfinding/${locationId}/${
                      reverseShortHandMap[route.type]
                    }`
                  )
                  .update(
                    makeSafeForDatabase({ [destinationLocationId]: routeIds })
                  )
                  .then(() =>
                    console.log(`Route removed from location: ${locationId}`)
                  )
              })
          })
      })
    }
  }

  const saveRoutes = async () => {
    // get from database
    const routesRef = database.ref("routes")
    const routesSnapshot = await routesRef.get()
    const routesFromDatabase: Routes = routesSnapshot.val() || {}

    // go through existing and overwrite if necessary
    Object.keys(routesFromDatabase).forEach(routeKey => {
      const newValue = routesToSave.find(x => x.uniqueId === routeKey)

      if (routesFromDatabase[routeKey].autoGenerated) {
        if (newValue) updateRoute(newValue)
        else deleteRoute(routeKey, routesFromDatabase[routeKey])
      }
    })

    // go through new and add if necessary
    routesToSave.forEach(route => {
      if (!routesFromDatabase[route.uniqueId]) {
        updateRoute(route)
      }
    })
  }

  /* ------------------ Hashes ------------------ */

  const updateHashes = () => {
    const newHash = Math.random().toString(36).substring(2, 15)
    Promise.allSettled([
      database.ref("hashes/routes").set(newHash),
      database.ref("hashes/locations").set(newHash),
      database.ref("hashes/providers").set(newHash),
      database.ref("hashes/pathfinding").set(newHash),
      database.ref("hashes/searchIndex").set(newHash),
    ]).then(() => {
      console.log("Hashes updated")
    })
  }

  saveProviders()
  saveLocations()
  saveRoutes()
  updateHashes()

  process.on("exit", () => {
    console.log("All data saved.")
  })
}
