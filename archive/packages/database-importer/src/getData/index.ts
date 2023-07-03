import fs from "node:fs/promises"
import path from "node:path"

import getDynmapAirports from "./getDynmapAirports"
import getDynmapMRT from "./getDynmapMRT"

export default async function getAllData() {
  const dynmapAirports = await getDynmapAirports()
  const dynmapMRT = await getDynmapMRT()

  // write to dynmap.json
  const dynmap = {
    // ...dynmapAirports,
    ...dynmapMRT,
  }

  // write to dynmap.json
  await fs.writeFile(
    path.join(__dirname, "../../../dynmap_RAW.json"),
    JSON.stringify(dynmap, null, 2)
  )

  return null
}
