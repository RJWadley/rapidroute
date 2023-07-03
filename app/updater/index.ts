"use server"

import importDynmapAirports from "./import/dynmapAirports"
import importDynmapMRT from "./import/dynmapMRT"

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const runImport = async () => {
  console.log("Importing...")
  await importDynmapAirports()
  await importDynmapMRT()
  await sleep(1000)
  console.log("Imported!")
}
