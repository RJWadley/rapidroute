import { Location } from "../types";
import { PathHeap } from "./routing";

let threadStarted = performance.now();
export async function throttle() {
  // if thread has been working for more than 2ms, await next thread
  if (performance.now() - threadStarted > 4) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
        threadStarted = performance.now();
      }, 0);
    });
  }
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function sortedIndex(array: PathHeap, value: number) {
  let low = 0;
  let high = array.length;

  while (low < high) {
    // eslint-disable-next-line no-bitwise
    const mid = (low + high) >>> 1;
    if (array[mid].time < value) low = mid + 1;
    else high = mid;
  }
  return low;
}

/**
 * given two locations, return the manhattan distance between them
 */
export function getDistance(from: Location, to: Location): number {
  if (!from.location || !to.location) return Infinity;

  return (
    Math.abs(from.location.x - to.location.x) +
    Math.abs(from.location.z - to.location.z)
  );
}
