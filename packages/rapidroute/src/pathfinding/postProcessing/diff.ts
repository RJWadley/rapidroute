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
  const common = results.reduce((acc, result) => {
    return acc.filter(item => result.includes(item))
  })

  // get the diff of each result
  return results.map(result => {
    return result.filter(item => !common.includes(item))
  })
}
