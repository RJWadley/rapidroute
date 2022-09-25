/* eslint-disable no-console */
import {
  Pathfinding,
  RouteMode,
  shortHandMap,
} from "@rapidroute/database-types"

import getRouteTime from "./getRouteTime"
import { GraphEdge, rawEdges, rawNodes } from "./mapEdges"
import { getDistance, throttle } from "./pathUtil"
import PriorityQueue from "./PriorityQueue"

export interface ResultType {
  path: string[]
  totalCost: number
}

export default class Pathfinder {
  from: string

  to: string

  maxCost: number = Infinity

  EXTRA_TIME = 100

  distanceTravelled = 0

  cancelled = false

  allowedModes: RouteMode[]

  edges: GraphEdge[] = []

  constructor(from: string, to: string, allowedModes: RouteMode[]) {
    this.from = from
    this.to = to
    this.allowedModes = [...allowedModes]
  }

  getPercentComplete() {
    return this.distanceTravelled / (this.maxCost - this.EXTRA_TIME)
  }

  async start(preventReverse = false): Promise<ResultType[]> {
    console.log("starting pathfinding from", this.from, "to", this.to)
    const frontier = new PriorityQueue<string>()
    const cameFrom: Record<string, string[]> = {}
    const costSoFar: Record<string, number> = {}
    const modeTo: Record<string, RouteMode[]> = {}
    const edges = await rawEdges
    this.edges = edges
    const nodes = await rawNodes

    // create coordinate edges if needed
    // in the form coordinate: number, number
    if (this.from.startsWith("coordinate: ")) {
      const [x, z] = this.from
        .replace("coordinate:", "")
        .split(",")
        .map(n => Number(n))
      const coordinateEdges = await Pathfinder.createCoordinateEdges(
        this.from,
        x,
        z
      )
      edges.push(...coordinateEdges)
    }
    if (this.to.startsWith("coordinate:")) {
      const [x, z] = this.to
        .replace("coordinate:", "")
        .split(",")
        .map(n => Number(n))
      const coordinateEdges = await Pathfinder.createCoordinateEdges(
        this.to,
        x,
        z
      )
      edges.push(...coordinateEdges)
    }

    frontier.enqueue(this.from, 0)
    costSoFar[this.from] = 0

    const start = performance.now()
    while (!frontier.isEmpty()) {
      if (this.cancelled) return []

      // eslint-disable-next-line no-await-in-loop
      await throttle()
      const current = frontier.dequeue()

      if (current === this.to || current === undefined) {
        break
      }

      this.updateMaxCost(nodes, current, costSoFar[current])
      this.distanceTravelled = Math.max(
        this.distanceTravelled,
        costSoFar[current]
      )

      edges
        .filter(edge => edge.from === current)
        .filter(edge => costSoFar[current] + edge.weight < this.maxCost)
        .forEach(async edge => {
          // skip edges that are not allowed
          if (this.allowedModes.length === 0) {
            throw new Error("no modes")
          }
          if (
            this.allowedModes.length > 0 &&
            !this.allowedModes.includes(edge.mode)
          )
            return

          // if we just walked, we can't walk again
          if (
            modeTo[current] &&
            modeTo[current].includes("walk") &&
            edge.mode === "walk"
          )
            return

          const newCost = costSoFar[current] + edge.weight
          this.updateMaxCost(nodes, edge.to, newCost)

          if (edge.to === this.from) return
          if (newCost > this.maxCost) return

          if (!costSoFar[edge.to] || newCost < costSoFar[edge.to]) {
            costSoFar[edge.to] = newCost
            const priority = newCost
            frontier.enqueue(edge.to, priority)
            cameFrom[edge.to] = [current]
            modeTo[edge.to] = [edge.mode]
          } else if (
            newCost === costSoFar[edge.to] &&
            !cameFrom[edge.to].includes(current)
          ) {
            cameFrom[edge.to].push(current)
            modeTo[edge.to].push(edge.mode)
          }
        })
    }

    const paths = this.reconstructPaths(cameFrom, this.to)

    if (paths.length === 0 && !preventReverse) {
      console.log("COULD NOT FIND PATH, TRYING REVERSE")
      const reversed = await new Pathfinder(
        this.to,
        this.from,
        this.allowedModes
      ).start(true)

      const end = performance.now()
      console.log(`Pathfinding took ${end - start}ms`)
      reversed.forEach(result => result.path.reverse())
      return reversed
    }

    const end = performance.now()
    if (!preventReverse) console.log(`Pathfinding took ${end - start}ms`)

    return paths
  }

  updateMaxCost(nodes: Pathfinding, nodeId: string, costSoFar: number) {
    const distanceToTo = getDistance(
      nodes[nodeId]?.x ?? Infinity,
      nodes[nodeId]?.z ?? Infinity,
      nodes[this.to]?.x ?? Infinity,
      nodes[this.to]?.z ?? Infinity
    )
    const timeToTo = getRouteTime(distanceToTo, "walk")
    const maxCost = costSoFar + timeToTo + this.EXTRA_TIME
    if (maxCost) this.maxCost = Math.min(this.maxCost, maxCost)
  }

  getSortingCost(from: string, to: string) {
    const allEdges = this.edges.filter(
      edge =>
        edge.from === from &&
        edge.to === to &&
        this.allowedModes.includes(edge.mode)
    )
    return Math.min(
      ...allEdges.map(edge => edge.sortWeight ?? edge.weight),
      Infinity
    )
  }

  /**
   * given a map of nodes to their parents, reconstruct all possible paths from the start to the end
   * @param cameFrom map of nodes to their parents
   * @param current the node to start reconstructing from
   * @returns array of possible paths, with a maximum
   */
  reconstructPaths(
    cameFrom: Record<string, string[]>,
    current: string
  ): ResultType[] {
    const pathsInProgress: ResultType[] = [{ path: [current], totalCost: 0 }]
    const results: ResultType[] = []
    const MAX_PATHS = 20

    while (pathsInProgress.length) {
      const pathInfo = pathsInProgress.pop()
      if (!pathInfo) break

      const lastNode = pathInfo.path[pathInfo.path.length - 1]
      const parents = cameFrom[lastNode]

      if (parents) {
        parents.forEach(parent => {
          const newPath = [...pathInfo.path, parent]
          if (pathsInProgress.length < MAX_PATHS * 2)
            pathsInProgress.push({
              path: newPath,
              totalCost:
                pathInfo.totalCost + this.getSortingCost(parent, lastNode),
            })
        })
      } else if (this.from === lastNode) {
        results.push(pathInfo)
      }

      if (results.length >= MAX_PATHS) break
    }

    results.forEach(result => {
      result.path.reverse()
    })

    return results
  }

  cancel() {
    this.cancelled = true
  }

  static async createCoordinateEdges(id: string, x: number, z: number) {
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

    console.log("created coordinate edges", walkingEdges)

    return walkingEdges
  }
}
