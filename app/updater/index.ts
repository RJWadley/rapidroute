"use server"

import getDynmapAirports from "./import/dynmapAirports"
import importDynmapMRT from "./import/dynmapMRT"
import {
  setupDatabase,
  updateCompany,
  updatePlace,
  updateRoute,
  updateRouteLeg,
  writeDatabase,
} from "./import/temporaryDatabase"
// import { importTransitSheet } from "./import/transitSheet"

export const runImport = async () => {
  console.log("Importing...")

  const startTime = performance.now()

  await setupDatabase()

  // fetch all the data simultaneously, then apply it synchronously
  const dynmapAirports = getDynmapAirports()
  const dynmapMrt = importDynmapMRT()
  // const transitSheet = importTransitSheet()

  // apply everything in the temporary database
  {
    const airports = await dynmapAirports
    airports.forEach(updatePlace)
  }
  {
    const { company, places, routes, routeLegs } = await dynmapMrt
    updateCompany(company)
    places.forEach(updatePlace)
    routes.forEach(updateRoute)
    routeLegs.forEach(updateRouteLeg)
  }
  // {
  //   const { companies, places, routes, connections } = await transitSheet
  //   companies.forEach(updateCompany)
  //   places.forEach(updatePlace)
  //   routes.forEach(updateRoute)
  //   connections.forEach(updateConnection)
  // }

  console.log("done applying data")

  await writeDatabase()

  const endTime = performance.now()

  console.log("Imported in", (endTime - startTime) / 1000, "seconds")
}
