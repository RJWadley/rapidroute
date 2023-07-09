"use server"

import importDynmapAirports from "./import/dynmapAirports"
import importDynmapMRT from "./import/dynmapMRT"
import { importTransitSheet } from "./import/transitSheet"

export const runImport = async () => {
  console.log("Importing...")

  await importDynmapAirports()
  await importDynmapMRT()
  await importTransitSheet()

  console.log("Imported!")
}
