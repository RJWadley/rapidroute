import { Place, Route } from "@rapidroute/database-utils"

export interface SegmentType {
  from: Place
  to: Place
  routes: (Route | null)[]
}

const MRT = "MRT Station"

export default function createSegments(
  locations: (Place | null)[],
  routes: (Route | null)[][]
) {
  const segments: SegmentType[] = []
  let passAlongMRT: Place | undefined

  // for each pair of locations, create a segment
  locations.forEach((to, i) => {
    if (i === 0) return
    const from = passAlongMRT ?? locations[i - 1]
    const afterFrom = locations[i + 1]

    const segmentRoutes = routes[i - 1] ?? []
    const afterRoutes = routes[i] ?? []

    if (
      from?.type === MRT &&
      to?.type === MRT &&
      afterFrom?.type === MRT &&
      segmentRoutes.length === 1 &&
      afterRoutes.length === 1
    ) {
      // if there is only one route, pass along the MRT
      passAlongMRT = from
      return
    }

    if (from && to)
      segments.push({
        from,
        to,
        routes: segmentRoutes,
      })
    passAlongMRT = undefined
  })

  return segments
}