import {
  RouteMode,
  shortHandMap,
  shortHandMapKeys,
  Pathfinding,
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

const isMRT = (id: string) => id.match(/^[a-zA-Z]{1,2}\d{1,3}$/g)

/**
 * first the database must be mapped to a graph
 */
export const rawEdges = (data: Pathfinding) => {
  const edgeIds = Object.keys(data)

  // for each route type in each nodes, generate edges to all listed nodes
  const routeEdges: GraphEdge[] = edgeIds.flatMap(from => {
    const shortTypes = shortHandMapKeys
    return shortTypes.flatMap(routeTypeShort => {
      const routes = data[from][routeTypeShort]

      if (routes) {
        return Object.entries(routes).flatMap(([to, routeInfo]) => {
          if (to === from || !data[to] || !data[from]) return []

          const routeIds = routeInfo.map(route => route.n)

          const x1 = data[from].x
          const y1 = data[from].z
          const x2 = data[to].x
          const y2 = data[to].z
          const distance =
            x1 && y1 && x2 && y2 ? getDistance(x1, y1, x2, y2) : Infinity
          const weight = getRouteTime(distance, shortHandMap[routeTypeShort])
          const sortWeight = getRouteTime(
            distance,
            shortHandMap[routeTypeShort],
            Math.max(...routeInfo.map(r => r.g || 0))
          )

          return [
            {
              from,
              to,
              weight,
              sortWeight,
              routes: routeIds,
              mode: shortHandMap[routeTypeShort],
            },
          ]
        })
      }
      return []
    })
  })

  // for each node, generate 5 walking edges to the closest nodes
  const walkingEdges: GraphEdge[] = edgeIds.flatMap(from => {
    const x1 = data[from].x
    const y1 = data[from].z
    const closestWalks = edgeIds
      .filter(to => to !== from)
      .map(to => {
        const x2 = data[to].x
        const y2 = data[to].z
        const distance =
          x1 && y1 && x2 && y2 ? getDistance(x1, y1, x2, y2) : Infinity
        return { to, distance }
      })
      // only include locations which have at least one route available at them
      .filter(({ to }) => {
        const shortTypes = shortHandMapKeys
        return shortTypes.some(routeTypeShort => {
          const routes = data[to][routeTypeShort]
          return !!routes && !routes[from]
        })
      })
      // filter out MRT stops on the same line unless the from is out of service
      .filter(({ to }) => {
        if (!data[from].M) return true
        if (from.charAt(0) === to.charAt(0)) return false
        return true
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .flatMap(({ to, distance }) => {
        const weight = getRouteTime(distance, "walk")

        const mode: RouteMode = isMRT(from) && isMRT(to) ? "MRT" : "walk"

        return [
          { from, to, weight, mode } as const,
          { to: from, from: to, weight, mode } as const,
        ]
      })

    return closestWalks
  })

  // spawn warp edges
  const warpEdges: GraphEdge[] = edgeIds.flatMap(placeId => {
    const isWarp = data[placeId].w
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

  return [...walkingEdges, ...routeEdges, ...warpEdges]
}
