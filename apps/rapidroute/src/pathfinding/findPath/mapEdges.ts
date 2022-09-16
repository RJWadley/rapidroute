import { getAll } from "data/getData"
import { shortHandMap } from "types/pathfinding"

import getRouteTime from "./getRouteTime"
import { getDistance } from "./pathUtil"

export interface GraphEdge {
  from: string
  to: string
  weight: number
  routes?: string[]
}

/**
 * first the database must be mapped to a graph
 */
export const rawEdges = getAll("pathfinding").then(data => {
  const edgeIds = Object.keys(data)

  // for each route type in each nodes, generate edges to all listed nodes
  const routeEdges: GraphEdge[] = edgeIds.flatMap(from => {
    const shortTypes = Object.keys(
      shortHandMap
    ) as (keyof typeof shortHandMap)[]
    return shortTypes.flatMap(routeTypeShort => {
      const routes = data[from][routeTypeShort]

      if (routes) {
        return Object.entries(routes).flatMap(([to, routeIds]) => {
          if (to === from) return []

          const x1 = data[from].x
          const y1 = data[from].z
          const x2 = data[to].x
          const y2 = data[to].z
          const distance =
            x1 && y1 && x2 && y2 ? getDistance(x1, y1, x2, y2) : Infinity
          const weight = getRouteTime(distance, shortHandMap[routeTypeShort])

          return [{ from, to, weight, routes: routeIds }]
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
      // only include locations which have at least one route availabe at them
      .filter(({ to }) => {
        const shortTypes = Object.keys(
          shortHandMap
        ) as (keyof typeof shortHandMap)[]
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
        return [
          { from, to, weight },
          { to: from, from: to, weight },
        ]
      })

    return closestWalks
  })

  return [...walkingEdges, ...routeEdges]
})
export const rawNodes = getAll("pathfinding")
