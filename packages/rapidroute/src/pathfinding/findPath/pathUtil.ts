let threadStarted = performance.now()
export async function throttle() {
  // if thread has been working for more than 6ms, await next thread
  if (performance.now() - threadStarted > 6) {
    await new Promise<void>(resolve => {
      setTimeout(() => {
        resolve()
      }, 0)
    })
  }
}

export async function strictThrottle() {
  // if thread has been working for more than 6ms, await next thread recursively
  if (performance.now() - threadStarted > 6) {
    await new Promise<void>(resolve => {
      setTimeout(async () => {
        await strictThrottle()
        resolve()
      }, 0)
    })
  }
}

// once per thread, update threadStarted
const updateThreadStarted = () => {
  threadStarted = performance.now()
  setTimeout(updateThreadStarted, 0)
}
updateThreadStarted()

export function sleep(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

/**
 * given two locations, return the manhattan distance between them
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2)
}
