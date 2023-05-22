import { Place, Route } from "@rapidroute/database-utils"

import { distance, Point, pointMatchesLine } from "./pointUtils"

export const getRoutes = ({
  allStations: allStationsIn,
  isLoop,
  line,
  lineName,
}: {
  allStations: Place[]
  line: Point[]
  isLoop: boolean
  lineName: string
}) => {
  let allStations = allStationsIn

  // iterate over the line, converting it to a list of stations
  const stations: Place[] = []

  line.forEach((point, i) => {
    const nextIndex = line[i + 1]
    const nextPoint = nextIndex ?? (isLoop ? line[0] : null)
    if (!nextPoint) return

    const newStations = allStations.filter(station => {
      return (
        station.coords && pointMatchesLine(station.coords, [point, nextPoint])
      )
    })

    // if we have multiple stations, we want to sort them by distance from the first point
    // closest stations come first, furthest stations come last
    newStations.sort((a, b) => {
      const distanceA = distance(a.coords, point)
      const distanceB = distance(b.coords, point)
      return distanceA - distanceB
    })
    stations.push(...newStations)

    // remove the stations we've already found from the list of stations to check
    allStations = allStations.filter(station => !newStations.includes(station))
  })

  // now, use the sequence of stations to create routes
  const routes: Route[] = stations
    .map((station, i) => {
      const nextIndex = stations[i + 1]
      const nextStation = nextIndex ?? (isLoop ? stations[0] : null)
      if (!nextStation) return null

      const route: Route = {
        uniqueId: `${station.uniqueId}-${nextStation.uniqueId}`,
        places: {
          [station.uniqueId]: "none",
          [nextStation.uniqueId]: "none",
        },
        provider: lineName,
        type: "MRT",
      }

      return route
    })
    .flatMap(x => (x ? [x] : []))

  return routes
}
