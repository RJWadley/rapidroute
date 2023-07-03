import { BarePlace, BareRoute, BareRoutePlace } from "types/aliases"

import { distance, Point, pointMatchesLine } from "./pointUtils"

const getCoords = (station: BarePlace) => {
  const { x, z } = station
  return x && z ? { x, z } : undefined
}

export const getRoutes = ({
  allStations: allStationsIn,
  isLoop,
  line,
  lineName,
}: {
  allStations: BarePlace[]
  line: Point[]
  isLoop: boolean
  lineName: string
}) => {
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
      (station) => !newStations.includes(station)
    )
  })

  // now, use the sequence of stations to create routes
  return stations
    .map((station, i) => {
      const nextIndex = stations[i + 1]
      const nextStation = nextIndex ?? (isLoop ? stations[0] : null)
      if (!nextStation) return null

      return {
        route: {
          id: `${station.id}-${nextStation.id}`,
          manual_keys: [],
          name: `MRT ${capitalize(lineName)} line`,
          num_gates: null,
          number: null,
          provider: lineName,
          type: "MRT",
        } satisfies BareRoute,
        places: [
          {
            gate: null,
            place: station.id,
            route: `${station.id}-${nextStation.id}`,
            manual_keys: [],
          },
          {
            gate: null,
            place: nextStation.id,
            route: `${station.id}-${nextStation.id}`,
            manual_keys: [],
          },
        ] satisfies BareRoutePlace[],
      }
    })
    .flatMap((x) => (x ? [x] : []))
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
