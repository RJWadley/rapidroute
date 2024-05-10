import type { RouteType } from "@prisma/client"

import { getDistance } from "./distance"
import type { GraphEdge, GraphPlace } from "./getEdgesAndPlaces"
import getRouteTime from "./getRouteTime"
import PriorityQueue from "./PriorityQueue"

export interface ResultType {
  path: GraphPlace[]
  totalCost: number
}

interface PathfinderOptions {
  from: GraphPlace
  to: GraphPlace
  edges: GraphEdge[]
  preventReverse: boolean
  places: GraphPlace[]
}

const frontier = new PriorityQueue<GraphPlace>()
const cameFrom = new Map<GraphPlace, GraphPlace[]>()
const costSoFar = new Map<GraphPlace, number>()
const modeTo = new Map<GraphPlace, RouteType[]>()

let maxCost = Infinity
let distanceTraveled = 0

export function getRoutes({
  preventReverse = false,
  from,
  to,
  edges,
  places,
}: PathfinderOptions): ResultType[] {
  // reset everything
  maxCost = Infinity
  distanceTraveled = 0
  frontier.clear()
  cameFrom.clear()
  costSoFar.clear()
  modeTo.clear()

  console.info("starting pathfinding from", from, "to", to)

  frontier.enqueue(from, 0)
  costSoFar.set(from, 0)

  const start = performance.now()
  while (!frontier.isEmpty()) {
    const current = frontier.dequeue()

    if (current === to || current === undefined) {
      break
    }

    updateMaxCost(current, to, costSoFar.get(current) ?? 0)
    distanceTraveled = Math.max(distanceTraveled, costSoFar.get(current) ?? 0)

    if (current.id.startsWith("J"))
      console.log(
        "checking routes out of",
        current.id,
        edges.filter((edge) => edge.from === current.id && edge.to === "WN43")
      )

    edges
      .filter((edge) => edge.from === current.id)
      .filter(
        (edge) => (costSoFar.get(current) ?? Infinity) + edge.weight < maxCost
      )
      .forEach((edge) => {
        const newCost = (costSoFar.get(current) ?? Infinity) + edge.weight
        const toEdge = places.find((place) => place.id === edge.to)
        if (!toEdge) return

        updateMaxCost(toEdge, to, newCost)

        if (edge.to === from.id) return
        if (newCost > maxCost) return

        if (
          !costSoFar.get(toEdge) ||
          newCost < (costSoFar.get(toEdge) ?? Infinity)
        ) {
          costSoFar.set(toEdge, newCost)
          const priority = newCost
          frontier.enqueue(toEdge, priority)
          cameFrom.set(toEdge, [current])
          modeTo.set(toEdge, [edge.type])
        } else if (
          newCost === costSoFar.get(toEdge) &&
          !cameFrom.get(toEdge)?.includes(current)
        ) {
          cameFrom.get(toEdge)?.push(current)
          modeTo.get(toEdge)?.push(edge.type)
        }
      })
  }

  const paths = reconstructPaths(edges, from, to)

  if (paths.length === 0 && !preventReverse) {
    console.info("Couldn't find a path... trying to go backwards!")
    const reversed = getRoutes({
      from: to,
      to: from,
      edges,
      places,
      preventReverse: true,
    })

    reversed.forEach((result) => result.path.reverse())
    return reversed
  }

  const end = performance.now()
  if (!preventReverse) console.info(`Pathfinding took ${end - start}ms`)

  return paths
}

function getSortingCost(
  edges: GraphEdge[],
  from: GraphPlace,
  to: GraphPlace | undefined
) {
  if (!to) return Infinity

  const allEdges = edges.filter(
    (edge) => edge.from === from.id && edge.to === to.id
  )
  return Math.min(
    ...allEdges.map((edge) => edge.sortWeight ?? edge.weight),
    Infinity
  )
}

function reconstructPaths(
  edges: GraphEdge[],
  from: GraphPlace,
  to: GraphPlace
): ResultType[] {
  const pathsInProgress: ResultType[] = [{ path: [to], totalCost: 0 }]
  const results: ResultType[] = []
  const MAX_PATHS = 20

  while (pathsInProgress.length > 0) {
    const pathInfo = pathsInProgress.pop()
    if (!pathInfo) break

    const lastNode = pathInfo.path.at(-1)
    const parents = lastNode ? cameFrom.get(lastNode) : undefined

    if (parents) {
      parents.forEach((parent) => {
        const newPath = [...pathInfo.path, parent]
        if (pathsInProgress.length < MAX_PATHS * 2)
          pathsInProgress.push({
            path: newPath,
            totalCost:
              pathInfo.totalCost + getSortingCost(edges, parent, lastNode),
          })
      })
    } else if (from === lastNode) {
      results.push(pathInfo)
    }

    if (results.length >= MAX_PATHS) break
  }

  results.forEach((result) => {
    result.path.reverse()
  })

  return results
}

function updateMaxCost(
  currentNode: GraphPlace,
  destinationNode: GraphPlace,
  thisCostSoFar: number
) {
  const distanceToTo = getDistance(
    currentNode.coordinate_x ?? Infinity,
    currentNode.coordinate_z ?? Infinity,
    destinationNode.coordinate_x ?? Infinity,
    destinationNode.coordinate_z ?? Infinity
  )
  const timeToTo = getRouteTime(distanceToTo, "Walk")
  const newMaxCost = thisCostSoFar + timeToTo + 100
  if (newMaxCost) maxCost = Math.min(maxCost, newMaxCost)
}
