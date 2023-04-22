import { Pathfinding, RouteMode } from "@rapidroute/database-types"
import { expose } from "utils/promise-worker"

import Pathfinder from "."
import { generateRawEdges } from "./mapEdges"

let pathfinderInstance: Pathfinder | undefined

export const initPathfinder = (pathfinding: Pathfinding) => {
  generateRawEdges(pathfinding)
}

export async function findPath(
  from: string,
  to: string,
  allowedModes: RouteMode[]
) {
  pathfinderInstance?.cancel()

  pathfinderInstance = new Pathfinder(from, to, allowedModes)

  return await pathfinderInstance.start()
}

const workerFunctions = { findPath, initPathfinder }

// Export the type for type checking
expose(workerFunctions)
type WorkerFunctions = typeof workerFunctions
// TODO -next-line import/prefer-default-export
export type { WorkerFunctions }
