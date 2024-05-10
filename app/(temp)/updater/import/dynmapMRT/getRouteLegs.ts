import type { BarePlace, BareRouteLeg } from "../temporaryDatabase"
import type { Point } from "./pointUtils"
import { distance, pointMatchesLine } from "./pointUtils"

const getCoords = (station: BarePlace) => {
  const { coordinate_x: x, coordinate_z: z } = station
  return x && z ? { x, z } : undefined
}

export const getConnections = ({
  allStations: allStationsIn,
  isLoop,
  line,
  routeId,
}: {
  allStations: BarePlace[]
  line: Point[]
  isLoop: boolean
  routeId: string
}): BareRouteLeg[] => {
  let allStations = allStationsIn

  // iterate over the line, converting it to a list of stations
  const stations: BarePlace[] = []

  line.forEach((point, i) => {
    const nextIndex = line[i + 1]
    const nextPoint = nextIndex ?? (isLoop ? line[0] : null)
    if (!nextPoint) return

    const newStations = allStations.filter((station) => {
      const coords = getCoords(station)
      return coords && pointMatchesLine(coords, [point, nextPoint])
    })

    // if we have multiple stations, we want to sort them by distance from the first point
    // closest stations come first, furthest stations come last
    newStations.sort((a, b) => {
      const aCoords = getCoords(a)
      const bCoords = getCoords(b)
      const distanceA = distance(aCoords, point)
      const distanceB = distance(bCoords, point)
      return distanceA - distanceB
    })
    stations.push(...newStations)

    // remove the stations we've already found from the list of stations to check
    allStations = allStations.filter(
      (station) => !newStations.includes(station),
    )
  })

  // now, use the sequence of stations to create routes
  return stations
    .map((station, i) => {
      const nextIndex = stations[i + 1]
      const nextStation = nextIndex ?? (isLoop ? stations[0] : null)
      const previousIndex = stations[i - 1]
      const previousStation = previousIndex ?? (isLoop ? stations.at(-1) : null)
      return {
        fromPlaceId: station.id,
        toPlaceId: nextStation?.id ?? previousStation?.id ?? "",
        routeId,
      } satisfies BareRouteLeg
    })
    .filter(Boolean)
}
