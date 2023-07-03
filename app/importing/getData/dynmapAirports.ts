import { createClient } from "@supabase/supabase-js"
import { env } from "env.mjs"
import mergeData from "importing/utils/mergeData"
import { Place } from "types/aliases"
import { MarkersResponse } from "types/dynmapMarkers"
import { Database } from "types/supabase"

const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

export default async function importDynmapAirports() {
  const markers = await fetch(
    "https://dynmap.minecartrapidtransit.net/tiles/_markers_/marker_new.json"
  )
    .then((res) => res.json())
    .then((data: MarkersResponse) => data)

  const airports = Object.entries(markers.sets.airports.markers).map(
    ([key, { label, x, z }]) => {
      return {
        short_name: key,
        name: label,
        type: "Airport",
        enabled: true,
        world_name: "New",
        x,
        z,
        IATA: key,
        manual_keys: [],
      } satisfies Partial<Place>
    }
  )

  for (const airport of airports) {
    const { data: existingAirport } = await supabase
      .from("places")
      .select("*")
      .eq("short_name", airport.short_name)
      .single()

    if (existingAirport) {
      const newValue = mergeData(existingAirport, airport)

      await supabase.from("places").update(newValue)
      console.log(`Updated airport ${airport.short_name}`)
    } else {
      await supabase.from("places").insert(airport)

      console.log(`Created airport ${airport.short_name}`)
    }
  }
}
