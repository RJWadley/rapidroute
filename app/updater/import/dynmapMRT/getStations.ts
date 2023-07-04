import { BarePlace } from "types/aliases"
import { MarkerSet } from "types/dynmapMarkers"

export const getStations = (set: MarkerSet) => {
  return Object.entries(set.markers).map(([key, { label, x, z }]) => {
    let currentId = key.toUpperCase()

    // fix id mistakes
    if (currentId === "WN34 STATION") currentId = "WN34"
    if (currentId === "MS") currentId = "MH"
    if (currentId === "M0") currentId = "MW"
    if (currentId === "WH24") currentId = "WN24"

    return {
      id: currentId.trim(),
      short_name: currentId,
      name: label,
      type: "MRT Station",
      enabled: true,
      world_name: "New",
      x,
      z,
      IATA: null,
      description: null,
      manual_keys: [],
    } satisfies BarePlace
  })
}
