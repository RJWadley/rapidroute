import { Pathfinding, RouteMode } from "@rapidroute/database-utils"
import { expose } from "comlink"

import Pathfinder from "."
import { generateRawEdges } from "./mapEdges"

let pathfinderInstance: Pathfinder | undefined

export const initPathfinder = (pathfinding: Pathfinding) => {
  generateRawEdges(pathfinding)
}

export async function findPath(
  from: string,
  to: string,
  allowedModes: readonly RouteMode[]
) {
  pathfinderInstance?.cancel()

  pathfinderInstance = new Pathfinder(from, to, allowedModes)

  return await pathfinderInstance.start()
}

const workerFunctions = { findPath, initPathfinder }
expose(workerFunctions)
export type FindPathWorkerType = typeof workerFunctions
