"use server"

import importDynmapAirports from "./import/dynmapAirports"
import importDynmapMRT from "./import/dynmapMRT"
import { importTransitSheet } from "./import/transitSheet"

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const runImport = async () => {
  console.log("Importing...")
  // await importDynmapAirports()
  // await importDynmapMRT()
  return importTransitSheet()
  console.log("Imported!")
}
