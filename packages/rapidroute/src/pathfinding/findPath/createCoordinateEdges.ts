import { shortHandMap } from "@rapidroute/database-types"

import getRouteTime from "./getRouteTime"
import { rawNodes } from "./mapEdges"
import { getDistance } from "./pathUtil"

export default async function createCoordinateEdges(
  id: string,
  x: number,
  z: number
) {
  const nodes = await rawNodes
  const nodeIds = Object.keys(nodes)
  const walkingEdges = nodeIds
    .map(nodeId => {
      const distance = getDistance(
        x,
        z,
        nodes[nodeId].x ?? Infinity,
        nodes[nodeId].z ?? Infinity
      )
      return { to: nodeId, distance }
    })
    .filter(({ to }) => {
      const shortTypes = Object.keys(
        shortHandMap
      ) as (keyof typeof shortHandMap)[]
      return shortTypes.some(routeTypeShort => {
        const routes = nodes[to][routeTypeShort]
        return !!routes
      })
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5)
    .flatMap(({ to, distance }) => {
      const weight = getRouteTime(distance, "walk")
      return [
        { from: id, to, weight, mode: "walk" } as const,
        { to: id, from: to, weight, mode: "walk" } as const,
      ]
    })

  // eslint-disable-next-line no-console
  console.log("created coordinate edges", walkingEdges)

  return walkingEdges
}