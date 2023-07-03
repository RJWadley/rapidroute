"use server"

import importDynmapAirports from "./import/dynmapAirports"

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const runImport = async () => {
  console.log("Importing...")
  await importDynmapAirports()
  await sleep(1000)
  console.log("Imported!")
}
