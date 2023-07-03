/**
 * given a list of results, return the diff
 *
 * for example, given [[a, b, d], [a, c, d]], return [b, c]
 *
 * @param results
 */
export default function resultDiffs(results: string[][]) {
  if (results.length === 0) {
    return []
  }

  // get list of items that are in all results
  const common = new Set(
    results[0]?.filter(item => {
      return results.every(result => result.includes(item))
    })
  )

  // get the diff of each result
  return results.map(result => {
    return result.filter(item => !common.has(item))
  })
}
