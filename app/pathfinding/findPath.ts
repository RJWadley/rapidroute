"use server"

import type { RouteType } from "@prisma/client"

import { getEdgesAndPlaces } from "./getEdgesAndPlaces"
import { getRoutes } from "./getRoutes"

export const findPath = async (
  from: string,
  to: string,
  allowedModes: RouteType[],
) => {
  const { edges, places } = await getEdgesAndPlaces(allowedModes)

  const fromEdge = places.find((place) => place.id === from)
  const toEdge = places.find((place) => place.id === to)

  if (!fromEdge || !toEdge) throw new Error("Could not find from or to")

  console.log("finding path from", from, "to", to)
  try {
    return getRoutes({
      edges,
      from: fromEdge,
      to: toEdge,
      preventReverse: false,
      places,
    }).map(
      (route) =>
        `${route.path.map((j) => j.id).join(" -> ")} (${route.totalCost})`,
    )
  } finally {
    console.log("finished finding path from", from, "to", to)
  }
}
