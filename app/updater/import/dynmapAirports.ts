import { BarePlace } from "types/aliases"
import { MarkersResponse } from "types/dynmapMarkers"
import { updateThing } from "updater/utils/updateThing"

export default async function importDynmapAirports() {
  const markers = await fetch(
    "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json",
  )
    .then((res) => res.json())
    .then((data: MarkersResponse) => data)

  const airports = Object.entries(markers.sets.airports.markers).map(
    ([key, { label, x, z }]) => {
      return {
        short_name: key.toUpperCase().trim(),
        name: label,
        type: "Airport",
        enabled: true,
        world_name: "New",
        x,
        z,
        IATA: key.toUpperCase().trim(),
        manual_keys: [],
        description: null,
        id: key.toUpperCase().trim(),
      } satisfies BarePlace
    },
  )

  const promises = airports.map(async (newAirport) => {
    await updateThing("place", newAirport)
  })

  return await Promise.all(promises)
}
