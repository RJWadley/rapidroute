import { pathingRouteTypes } from "@rapidroute/database-types"
import { getAll } from "data/getData"

const getDistance = (
  x1: number | undefined,
  y1: number | undefined,
  x2: number | undefined,
  y2: number | undefined
) => {
  if (
    x1 === undefined ||
    y1 === undefined ||
    x2 === undefined ||
    y2 === undefined
  ) {
    return 0
  }

  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

/**
 * this isn't used on the live site, but someone wanted to know how long the longest route was
 */
getAll("pathfinding")
  .then(data => {
    const allPlaces = Object.values(data)

    // find the two furthest apart points that have a path between them
    let furthest = 0
    let furthestA = "never"
    let furthestB = "never"
    for (const placeA of allPlaces) {
      for (const placeB of allPlaces) {
        const modes = pathingRouteTypes
        for (const mode of modes) {
          const placesA = Object.keys(placeA[mode] ?? {})
          if (placesA.includes(placeB.uniqueId)) {
            const distance = getDistance(placeA.x, placeA.z, placeB.x, placeB.z)
            if (distance > furthest) {
              furthest = distance
              furthestA = placeA.uniqueId
              furthestB = placeB.uniqueId
            }
          }
        }
      }
    }

    return `The furthest apart points are ${furthestA} and ${furthestB} at ${furthest}`
  })
  .catch(error => {
    console.error("error fetching pathfinding data", error)
  })
