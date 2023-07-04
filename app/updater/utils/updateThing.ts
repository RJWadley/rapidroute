/* eslint-disable @typescript-eslint/no-unused-vars */
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

const MAX_CONCURRENT_REQUESTS = 100
let currentRequests = 0
const queue: VoidFunction[] = []
const endRequest = () => {
  currentRequests -= 1
  const next = queue.shift()
  next?.()
}

/**
 * throttle database requests to avoid hitting the nodejs memory limit
 */
const startRequest = () => {
  return new Promise<void>((resolve) => {
    console.log("Waiting for request", queue.length, "in queue")
    const onReady = () => {
      currentRequests += 1
      resolve()
    }
    if (currentRequests < MAX_CONCURRENT_REQUESTS) {
      onReady()
    } else {
      queue.push(onReady)
    }
  })
}

export async function updateThing<T extends "place" | "provider" | "route">(
  type: T,
  newThing: ThingType<T>
) {
  await startRequest()
  const { data, error } = await supabase
    .from(type + "s")
    .select("*")
    .eq("id", newThing.id)
    .single()

  const existingThing = data as ThingType<T> | null

  if (existingThing) {
    const newValue = mergeData(existingThing, newThing)

    await supabase.from(type + "s").update(newValue)
    console.log(`Updated ${type} ${newThing.id}`)
  } else {
    await supabase.from(type + "s").insert(newThing)

    console.log(`Created ${type} ${newThing.id} ${JSON.stringify(error)}\n\n`)
  }
  endRequest()
}

export async function updateRoutePlaces(newRoutePlace: BareRoutePlace) {
  await startRequest()
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
  endRequest()
}
