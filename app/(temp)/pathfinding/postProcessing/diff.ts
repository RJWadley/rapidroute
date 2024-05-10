/* eslint-disable unicorn/no-array-reduce */

import { prisma } from "(temp)/data/client"

/**
 * group the array of strings by their common letters, ignoring numbers
 *
 * for example, given ["a1", "a2", "b1", "b2", "c1", "d1", "d2"]
 * it will return [["a1", "a2"], ["b1", "b2"], ["c1"], ["d1", "d2"]]
 */
const groupByCommonLetters = (arr: string[]) => {
  const groups: string[][] = []
  let group: string[] = []
  let prev = ""
  arr.forEach((str) => {
    const curr = str.replaceAll(/\d/g, "")
    if (curr !== prev) {
      if (group.length > 0) {
        groups.push(group)
      }
      group = []
      prev = curr
    }
    group.push(str)
  })
  if (group.length > 0) {
    groups.push(group)
  }
  return groups
}

/**
 * given groups of strings, return a string that best describes each group
 *
 * for example, given [["a1", "a2"], ["b1", "b2"], ["c1"], ["d1", "d2"]]
 * it will return ["a", "b", "c1", "d"]
 */
const describeGroups = (groups: string[][]) => {
  return groups.map((group) => {
    if (group.length === 1) return group[0] ?? ""

    // find the common prefix
    let prefix = ""
    for (let i = 0; i < (group[0]?.length ?? Infinity); i += 1) {
      const char = group[0]?.[i] ?? ""
      if (group.every((str) => str[i] === char) && /\D/.test(char)) {
        prefix += char
      } else {
        break
      }
    }

    return prefix
  })
}

/**
 * join the array of strings with commas and the last one with "and"
 * strings from the array should be bold
 *
 * if the array is empty, return "fastest route"
 */
const listify = (arr: string[]) => {
  if (arr.length === 0) {
    return `Fastest Route`
  }
  if (arr.length === 1) {
    return `${arr[0]}`
  }
  if (arr.length === 2) {
    return `${arr[0]} and ${arr[1]}`
  }
  return `${arr.slice(0, -1).join(", ")}and ${arr.at(-1)}`
}

/**
 * given a list of results, return the diff
 *
 * for example, given [[a, b, d], [a, c, d]], return [b, c]
 *
 * @param results
 */
export function getResultDiff(results: string[][]) {
  if (results.length === 0) {
    return []
  }

  // get list of items that are in all results
  const common = results.reduce((acc, result) => {
    return acc.filter((item) => result.includes(item))
  })

  // get the diff of each result
  return results.map((result) => {
    return result.filter((item) => !common.includes(item))
  })
}

export async function describeDiff(diff: string[]) {
  const groups = groupByCommonLetters(diff)
  const descriptions = describeGroups(groups)

  const placeNamePromises = descriptions.map((description) => {
    return prisma.place.findFirst({
      where: {
        id: description,
      },
      select: {
        IATA: true,
        name: true,
      },
    })
  })

  const places = await Promise.all(placeNamePromises)
  return listify(
    places.map((place) => place?.IATA ?? place?.name ?? "Unknown Place")
  )
}
