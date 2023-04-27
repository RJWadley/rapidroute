import {
  Pathfinding,
  pathingRouteTypes,
  RouteMode,
} from "@rapidroute/database-types"

import getRouteTime from "./getRouteTime"
import { getDistance } from "./pathUtil"

export interface GraphEdge {
  from: string
  to: string
  weight: number
  routes?: string[]
  mode: RouteMode
  sortWeight?: number
}

const isMRT = (id: string) => id.match(/^[A-Za-z]{1,2}\d{1,3}$/g)

export const rawEdges: GraphEdge[] = []
export const pathfindingIndex: Pathfinding = {}

/**
 * first the database must be mapped to a graph
 */
export const generateRawEdges = (data: Pathfinding) => {
  Object.assign(pathfindingIndex, data)

  const edgeIds = Object.keys(data)

  // for each route type in each nodes, generate edges to all listed nodes
  const routeEdges: GraphEdge[] = edgeIds.flatMap(from => {
    const shortTypes = pathingRouteTypes
    return shortTypes.flatMap(routeTypeShort => {
      const routes = data[from]?.[routeTypeShort]

      if (routes) {
        return Object.entries(routes).flatMap(([to, routeInfo]) => {
          if (to === from || !data[to] || !data[from]) return []

          // eslint-disable-next-line max-nested-callbacks
          const routeIds = routeInfo.map(route => route.routeName)

          const x1 = data[from]?.x
          const y1 = data[from]?.z
          const x2 = data[to]?.x
          const y2 = data[to]?.z
          const distance =
            x1 && y1 && x2 && y2 ? getDistance(x1, y1, x2, y2) : Infinity
          const weight = getRouteTime(distance, routeTypeShort)
          const sortWeight = getRouteTime(
            distance,
            routeTypeShort,
            // eslint-disable-next-line max-nested-callbacks
            Math.max(...routeInfo.map(r => r.numberOfGates ?? 0))
          )

          return [
            {
              from,
              to,
              weight,
              sortWeight,
              routes: routeIds,
              mode: routeTypeShort,
            },
          ]
        })
      }
      return []
    })
  })

  // for each node, generate 5 walking edges to the closest nodes
  const walkingEdges: GraphEdge[] = edgeIds.flatMap(from => {
    const x1 = data[from]?.x
    const y1 = data[from]?.z
    return (
      edgeIds
        .filter(to => to !== from)
        .map(to => {
          const x2 = data[to]?.x
          const y2 = data[to]?.z
          const distance =
            x1 && y1 && x2 && y2 ? getDistance(x1, y1, x2, y2) : Infinity
          return { to, distance }
        })
        // filter out MRT stops on the same line unless the from is out of service
        .filter(({ to }) => {
          if (!data[from]?.MRT) return true
          return !from.startsWith(to.charAt(0))
        })
        .sort((a, b) => a.distance - b.distance)
        // only include locations which have at least one route available at them
        .filter(({ to }, i) => {
          if (i === 0) return true // keep the closest location regardless
          const shortTypes = pathingRouteTypes
          return shortTypes.some(routeTypeShort => {
            const routes = data[to]?.[routeTypeShort]
            return !!routes && !routes[from]
          })
        })
        .slice(0, 5)
        .flatMap(({ to, distance }) => {
          const weight = getRouteTime(distance, "walk")

          const mode: RouteMode =
            isMRT(from) &&
            isMRT(to) &&
            getDistance(
              data[from]?.x ?? Infinity,
              data[from]?.z ?? Infinity,
              data[to]?.x ?? Infinity,
              data[to]?.z ?? Infinity
            ) < 200
              ? "MRT"
              : "walk"

          return [
            { from, to, weight, mode } as const,
            { to: from, from: to, weight, mode } as const,
          ]
        })
    )
  })

  // spawn warp edges
  const warpEdges: GraphEdge[] = edgeIds.flatMap(placeId => {
    const isWarp = data[placeId]?.isWarp
    if (isWarp) {
      return [
        {
          from: "Spawn",
          to: placeId,
          weight: 120,
          mode: "spawnWarp",
        },
        {
          to: "Spawn",
          from: placeId,
          weight: 120,
          mode: "spawnWarp",
        },
      ]
    }
    return [
      {
        to: "Spawn",
        from: placeId,
        weight: 120,
        mode: "spawnWarp",
      },
    ]
  })

  rawEdges.length = 0
  rawEdges.push(...walkingEdges, ...routeEdges, ...warpEdges)
}
