import { Place } from "@prisma/client"
import searcher from "fuzzysort"
import { useDeferredValue, useMemo } from "react"

export const useSearchResults = <T extends Partial<Place>>(
  rawQuery: string | undefined | null,
  initialPlaces: T[]
) => {
  const query = useDeferredValue(rawQuery)

  const results = useMemo(
    () =>
      query
        ? searcher.go(query, initialPlaces, {
            keys: ["name", "IATA", "type", "worldName"],
            limit: 20,
          })
        : null,
    [query, initialPlaces]
  )

  return results ? results.map((r) => r.obj) : initialPlaces
}
