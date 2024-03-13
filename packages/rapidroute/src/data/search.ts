import { useState, useEffect } from "react"

import { Index } from "flexsearch-ts"

import { getAll } from "./getData"
import isCoordinate from "./isCoordinate"

const searchWorker =
  Index &&
  new Index({
    tokenize: "reverse",
    charset: "latin:simple",
  })

const displayLookup: Record<string, string> = {}

getAll("searchIndex")
  .then(data => {
    Object.keys(data).forEach(key => {
      searchWorker.add(key, data[key].i)
      // strictSearchWorker.add(key, data[key].i)
      displayLookup[key] = data[key].d
    })
  })

  .catch(console.error)

export function search(query: string) {
  let results = searchWorker.search(query, {
    suggest: true,
    limit: 200,
  })

  const strictMatches = results.filter(x =>
    x.toString().toLowerCase().replace("_", " ").startsWith(query.toLowerCase())
  )
  strictMatches.sort((a, b) => a.toString().length - b.toString().length)

  results = [...new Set([...strictMatches, ...results])]

  if (results.length && "central city".startsWith(query.toLowerCase())) {
    results = results.filter(x => x !== "Spawn")
    results = ["Spawn", ...results]
  }

  const coordData = isCoordinate(query)
  if (coordData) {
    const { x, z } = coordData
    results.unshift(`Coordinate: ${x}, ${z}`)
  }

  if (
    (query && query.length < 2) ||
    /cur|loca/.test(query) ||
    (results.length < 1 && query.length > 2)
  ) {
    results.unshift("Current Location")
  }

  return results.map(x => (typeof x === "number" ? x.toString() : x))
}

export function getTextboxName(locationId: string | null) {
  if (!locationId) return ""
  return displayLookup[locationId] ?? locationId
}

export function useSearch(searchTerm: string | undefined) {
  const [results, setResults] = useState<string[]>([])
  const numberOfItems = Object.keys(displayLookup).length

  useEffect(() => {
    if (searchTerm) setResults(search(searchTerm))
  }, [searchTerm, numberOfItems])
  return results
}
