"use server"

import getDynmapAirports from "./import/dynmapAirports"
import importDynmapMRT from "./import/dynmapMRT"
import {
  setupDatabase,
  updateCompany,
  updateConnection,
  updatePlace,
  updateRoute,
  writeDatabase,
} from "./import/temporaryDatabase"
import { importTransitSheet } from "./import/transitSheet"

export const runImport = async () => {
  console.log("Importing...")

  await setupDatabase()

  // fetch all the data simultaneously, then apply it synchronously
  const dynmapAirports = getDynmapAirports()
  const dynmapMrt = importDynmapMRT()
  const transitSheet = importTransitSheet()

  // apply everything in the temporary database
  {
    const airports = await dynmapAirports
    airports.forEach(updatePlace)
  }
  {
    const { company, places, routes, connections } = await dynmapMrt
    updateCompany(company)
    places.forEach(updatePlace)
    routes.forEach(updateRoute)
    connections.forEach(updateConnection)
  }
  {
    const { companies, places, routes, connections } = await transitSheet
    companies.forEach(updateCompany)
    places.forEach(updatePlace)
    routes.forEach(updateRoute)
    connections.forEach(updateConnection)
  }

  console.log("done applying data")

  await writeDatabase()

  console.log("Imported!")
}
