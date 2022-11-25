const MAX_CONCURRENT_REQUESTS = 500

/**
 * map over a list of async functions, running a maximum of MAX_CONCURRENT_REQUESTS at a time
 */
export default async function throttledMap<T, U>(
  list: T[],
  fn: (item: T) => Promise<U>
): Promise<U[]> {
  const results: U[] = []
  const promises: Promise<void>[] = []
  while (list.length) {
    if (promises.length < MAX_CONCURRENT_REQUESTS) {
      const nextItem = list.pop()
      if (nextItem) {
        promises.push(
          fn(nextItem).then(result => {
            results.push(result)
          })
        )
      }
    } else {
      const promiseToAwait = promises.shift()
      // eslint-disable-next-line no-await-in-loop
      if (promiseToAwait) await promiseToAwait
      console.log("Throttled map:", list.length, " promises remaining")
    }
  }

  await Promise.all(promises)
  return results
}
