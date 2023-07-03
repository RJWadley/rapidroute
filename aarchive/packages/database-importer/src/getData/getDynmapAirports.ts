import { Place } from "@rapidroute/database-utils"

import { MarkerResponse } from "../types/markersType"

export default async function getDynmapAirports() {
  const markers = await fetch(
    "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
  )
    .then(res => res.json())
    .then((data: MarkerResponse) => data)

  const allAirports: Place[] = Object.entries(
    markers.sets.airports.markers
  ).map(([key, { label, x, y, z }]) => {
    return {
      uniqueId: key,
      shortName: key,
      name: label,
      type: "Airport",
      enabled: true,
      world: "New",
      coords: {
        x,
        y,
        z,
      },
      IATA: key,
    }
  })

  return allAirports
}
