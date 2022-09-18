import { shortHandMap } from "@rapidroute/database-types"
import { getAll } from "data/getData"

const getDistance = (
  x1: number | null,
  y1: number | null,
  x2: number | null,
  y2: number | null
) => {
  if (x1 === null || y1 === null || x2 === null || y2 === null) {
    return 0
  }

  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

getAll("pathfinding").then(data => {
  const allPlaces = Object.values(data)

  // find the two furthest apart points that have a path between them
  let furthest = 0
  let furthestA = "never"
  let furthestB = "never"
  for (let i = 0; i < allPlaces.length; i += 1) {
    for (let j = 0; j < allPlaces.length; j += 1) {
      const placeA = allPlaces[i]
      const placeB = allPlaces[j]

      const modes = Object.keys(shortHandMap) as Array<
        keyof typeof shortHandMap
      >
      for (let k = 0; k < modes.length; k += 1) {
        const mode = modes[k]

        const placesA = Object.keys(placeA[mode] || {})

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

  console.log(
    "The furthest apart points are",
    furthestA,
    "and",
    furthestB,
    "at",
    furthest
  )
})
