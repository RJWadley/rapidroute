import { expose } from "./promise-worker"

function add(a: number, b: number) {
  return a + b
}

function multiply(a: number, b: number) {
  // freeze the main thread for 10 seconds
  const start = Date.now()
  while (Date.now() - start < 10000) {
    // do nothing
  }

  return a * b
}

expose({ add, multiply })

// Export the type for type checking
const workerFunctions = { add, multiply }
type WorkerFunctions = typeof workerFunctions
// eslint-disable-next-line import/prefer-default-export
export type { WorkerFunctions }
