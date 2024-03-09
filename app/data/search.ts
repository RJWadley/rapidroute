import { Place } from "@prisma/client"
import MiniSearch from "minisearch"
import { useEffect, useMemo } from "react"

export const useSearchResults = <T extends Partial<Place>>(
  query: string | undefined | null,
  initialPlaces: T[],
) => {
  /**
   * create our search indexes
   */
  const fuzzyMatcher = useMemo(() => {
    return new MiniSearch<T>({
      fields: ["id", "name", "IATA", "type", "worldName"],
      searchOptions: {
        prefix: true,
        fuzzy: 0.2,
      },
    })
  }, [])

  /**
   * add each item to the search index
   */
  useEffect(() => {
    fuzzyMatcher.addAll(
      initialPlaces.filter((item) => !fuzzyMatcher.has(item.id)),
    )
  }, [fuzzyMatcher, initialPlaces])

  /**
   * search for items based on the search term
   */
  const results = useMemo(
    () => (query ? fuzzyMatcher.search(query) : []),
    [fuzzyMatcher, query],
  )
    .map((result) => initialPlaces.find((item) => item.id === result.id))
    .filter(Boolean)
    // only keep first 50
    .slice(0, 50)

  return query ? results : initialPlaces
}
