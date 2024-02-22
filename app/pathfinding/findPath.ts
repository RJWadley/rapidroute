"use server"

import type { Place, Route, RouteType } from "@prisma/client"

import { getEdgesAndPlaces } from "./getEdgesAndPlaces"
import { getRoutes } from "./getRoutes"
import { getPrettyEdge } from "./getPrettyEdge"

export const findPath = async (
  from: string,
  to: string,
  allowedModes: RouteType[]
) => {
  const { edges, places } = await getEdgesAndPlaces(allowedModes)

  const fromEdge = places.find((place) => place.id === from)
  const toEdge = places.find((place) => place.id === to)

  if (!fromEdge || !toEdge) throw new Error("Could not find from or to")

  console.log("finding path from", from, "to", to)
  try {
    const basicRoutes = getRoutes({
      edges,
      from: fromEdge,
      to: toEdge,
      preventReverse: false,
      places,
    })

    // for each route, get the actual information
    const fullRoutes = basicRoutes.map((route) => ({
      cost: route.totalCost,
      path: route.path
        .map((thisPlace, index) => {
          const nextPlace = route.path[index + 1]

          return nextPlace ? getPrettyEdge(thisPlace.id, nextPlace.id) : null
        })
        .filter(Boolean),
    }))

    // unwrap the promises
    return await Promise.all(
      fullRoutes.map(async (route) => ({
        cost: route.cost,
        path: await Promise.all(route.path),
      }))
    )
  } finally {
    console.log("finished finding path from", from, "to", to)
  }
}
