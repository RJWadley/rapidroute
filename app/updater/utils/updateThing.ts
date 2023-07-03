import { createClient } from "@supabase/supabase-js"
import { env } from "env.mjs"
import {
  BarePlace,
  BareProvider,
  BareRoute,
  BareRoutePlace,
} from "types/aliases"
import { Database } from "types/supabase"

import mergeData from "./mergeData"

const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

type ThingType<T> = T extends "place"
  ? BarePlace
  : T extends "provider"
  ? BareProvider
  : T extends "route"
  ? BareRoute
  : never

export async function updateThing<T extends "place" | "provider" | "route">(
  type: T,
  newThing: ThingType<T>
) {
  const { data: existingThing } = await supabase
    .from("places")
    .select("*")
    .eq("id", newThing.id)
    .single()

  if (existingThing) {
    const newValue = mergeData(existingThing, newThing)

    await supabase.from(type + "s").update(newValue)
    console.log(`Updated ${type} ${newThing.id}`)
  } else {
    await supabase.from(type + "s").insert(newThing)

    console.log(`Created ${type} ${newThing.id}`)
  }
}

export async function updateRoutePlaces(newRoutePlace: BareRoutePlace) {
  // find the existing route place
  const { data: existingRoutePlace } = await supabase
    .from("routes_places")
    .select("*")
    .eq("route", newRoutePlace.route)
    .eq("place", newRoutePlace.place)
    .single()

  if (existingRoutePlace) {
    const newValue = mergeData(existingRoutePlace, newRoutePlace)

    await supabase.from("routes_places").update(newValue)
    console.log(
      `Updated route place ${newRoutePlace.route} ${newRoutePlace.place ?? ""}`
    )
  } else {
    await supabase.from("routes_places").insert(newRoutePlace)

    console.log(
      `Created route place ${newRoutePlace.route} ${newRoutePlace.place ?? ""}`
    )
  }
}
