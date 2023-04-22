import { Pathfinding, shortHandMapKeys } from "@rapidroute/database-types"
import isCoordinate from "data/isCoordinate"

import getRouteTime from "./getRouteTime"
import { GraphEdge } from "./mapEdges"
import { getDistance } from "./pathUtil"

export async function createCoordinateEdges(
  id: string,
  x: number,
  z: number,
  nodes: Pathfinding
) {
  const nodeIds = Object.keys(nodes)
  const walkingEdges = nodeIds
    .map(nodeId => {
      const distance = getDistance(
        x,
        z,
        nodes[nodeId]?.x ?? Infinity,
        nodes[nodeId]?.z ?? Infinity
      )
      return { to: nodeId, distance }
    })
    .filter(({ to }) => {
      const shortTypes = shortHandMapKeys
      return shortTypes.some(routeTypeShort => {
        const routes = nodes[to]?.[routeTypeShort]
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
        { from: id, to: "Spawn", weight: 120, mode: "spawnWarp" } as const,
      ]
    })

  return walkingEdges
}

export async function generateAllCoordinateEdges(
  from: string,
  to: string,
  nodes: Pathfinding
): Promise<GraphEdge[]> {
  const edges: GraphEdge[] = []
  // create coordinate edges if needed
  if (isCoordinate(from)) {
    const [x, z] = from
      .replace("Coordinate:", "")
      .split(",")
      .map(n => Number(n))
    if (x && z) {
      const coordinateEdges = await createCoordinateEdges(from, x, z, nodes)
      edges.push(...coordinateEdges)

      const distanceFromStartToFinish = getDistance(
        x,
        z,
        nodes[to]?.x ?? Infinity,
        nodes[to]?.z ?? Infinity
      )
      edges.push({
        from,
        to,
        weight: getRouteTime(distanceFromStartToFinish, "walk"),
        mode: "walk",
      })
    }
  }
  if (isCoordinate(to)) {
    const [x, z] = to
      .replace("Coordinate:", "")
      .split(",")
      .map(n => Number(n))
    if (x && z) {
      const coordinateEdges = await createCoordinateEdges(to, x, z, nodes)
      edges.push(...coordinateEdges)
    }
  }

  return edges
}
