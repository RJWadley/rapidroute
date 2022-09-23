import { ResultType } from "pathfinding/findPath"
import resultDiffs from "./diff"

/**
 * if, when comparing a route to the one before and after it, there is only a single difference
 * between the two routes AND the index of that difference is i in the route before and i+1 in the
 * route after, then we can assume that the route is a duplicate
 *
 * this is mainly designed to handle cases where you must transfer between two parallel lines, but the transfer
 * could be done at several similar points along the route. we only keep the first possible transfer point and the last.
 */
export default function removeExtras(results: ResultType[]) {
  // compare each result to the next and previous

  const indexesToRemove: number[] = []
  for (let i = 1; i < results.length - 1; i += 1) {
    const prev = results[i - 1]
    const curr = results[i]
    const next = results[i + 1]
    if (!prev || !curr || !next) throw new Error("invalid results")

    const beforeDiff = resultDiffs([prev.path, curr.path])
    const afterDiff = resultDiffs([curr.path, next.path])

    const beforeIndex = curr.path.indexOf(beforeDiff[1][0])
    const afterIndex = curr.path.indexOf(afterDiff[0][0])

    // if the current result has a single difference
    if (beforeDiff[1].length === 1 && afterDiff[0].length === 1) {
      // and the index of that difference is i in the previous result and i+1 in the next result
      if (beforeIndex + 1 === afterIndex) {
        // then we can assume that the current result is a duplicate
        indexesToRemove.push(i)
      }
      // and also vice versa
      if (beforeIndex === afterIndex + 1) {
        indexesToRemove.push(i)
      }
    }
  }

  // remove the duplicates
  const filteredResults = results.filter((_, i) => !indexesToRemove.includes(i))

  return filteredResults
}
