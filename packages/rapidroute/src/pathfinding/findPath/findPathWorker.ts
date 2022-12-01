import { RouteMode } from "@rapidroute/database-types"

import { expose } from "utils/promise-worker"

import Pathfinder from "."

let pathfinderInstance: Pathfinder | undefined

export async function findPath(
  from: string,
  to: string,
  allowedModes: RouteMode[]
) {
  pathfinderInstance?.cancel()

  pathfinderInstance = new Pathfinder(from, to, allowedModes)

  const result = await pathfinderInstance.start()

  return result
}

expose({ findPath })

// Export the type for type checking
const workerFunctions = { findPath }
type WorkerFunctions = typeof workerFunctions
// eslint-disable-next-line import/prefer-default-export
export type { WorkerFunctions }
