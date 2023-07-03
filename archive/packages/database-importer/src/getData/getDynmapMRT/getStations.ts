import { Place } from "@rapidroute/database-utils"

import { MarkerSet } from "../../types/markersType"

export const getStations = (set: MarkerSet): Place[] => {
  return Object.entries(set.markers).map(([key, { label, x, y, z }]) => {
    return {
      uniqueId: key,
      shortName: key,
      name: label,
      type: "MRT Station",
      enabled: true,
      world: "New",
      coords: {
        x,
        y,
        z,
      },
    }
  })
}
