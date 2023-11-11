import flexsearch from "flexsearch-ts"
import { isBrowser } from "utils/isBrowser"

const { Index } = flexsearch

const searchWorker = isBrowser
  ? new Index({
      tokenize: "reverse",
      charset: "latin:simple",
    })
  : undefined

const displayLookup: Record<string, string> = {}

// TODO fix me!
// prisma.place
//   .findMany()
//   .then((data) => {
//     return data.forEach((place) => {
//       searchWorker?.add(place.id, JSON.stringify(place))
//       displayLookup[place.id] = place.name
//     })
//   })
//   .catch(console.error)

export function search(query: string) {
  let results =
    searchWorker?.search(query, {
      suggest: true,
      limit: 200,
    }) ?? []

  const strictMatches = results.filter((x) =>
    x
      .toString()
      .toLowerCase()
      .replace("_", " ")
      .startsWith(query.toLowerCase()),
  )
  strictMatches.sort((a, b) => a.toString().length - b.toString().length)

  results = [...new Set([...strictMatches, ...results])]

  if (results.length > 0 && "central city".startsWith(query.toLowerCase())) {
    results = results.filter((x) => x !== "Spawn")
    results = ["Spawn", ...results]
  }

  if (/\d+[ ,]+\d+/g.test(query)) {
    const [xCoord, yCoord] = query.match(/\d+/g) ?? [0, 0]
    results.unshift(`Coordinate: ${xCoord}, ${yCoord}`)
  }

  if (
    (query && query.length < 2) ||
    /cur|loca/.test(query) ||
    (results.length === 0 && query.length > 2)
  ) {
    results.unshift("Current Location")
  }

  return results.map((x) => (typeof x === "number" ? x.toString() : x))
}

export function getTextboxName(locationId: string | null | undefined) {
  if (!locationId) return ""
  return displayLookup[locationId] ?? locationId
}

export function useSearch(searchTerm: string | undefined) {
  return searchTerm ? search(searchTerm) : []
}
