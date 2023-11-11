let threadStarted = performance.now()
export async function throttle() {
  // if thread has been working for more than 100ms, await next thread
  if (performance.now() - threadStarted > 100) {
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
        threadStarted = performance.now()
      }, 0)
    })
  }
}

/**
 * given two locations, return the manhattan distance between them
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}
