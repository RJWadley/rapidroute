import { Index } from "flexsearch-ts"
import { encode } from "flexsearch-ts/dist/module/lang/latin/extra"
import { useEffect, useMemo, useState } from "react"

export const useSearchResults = <T extends { id: string }>(
  query: string | undefined | null,
  items: T[],
  itemToString: (arg0: T) => string,
) => {
  /**
   * create our search indexes
   */
  const [fuzzyMatcher] = useState(
    () =>
      new Index({
        tokenize: "full",
        charset: "latin:simple",
        encode,
      }),
  )
  const [strictMatcher] = useState(
    () =>
      new Index({
        tokenize: "full",
        charset: "latin:simple",
      }),
  )

  /**
   * add each item to the search index
   */
  useEffect(() => {
    for (const item of items) {
      if (!fuzzyMatcher.contain(item.id))
        fuzzyMatcher.add(item.id, itemToString(item))
      if (!strictMatcher.contain(item.id))
        strictMatcher.add(item.id, itemToString(item))
    }
  }, [fuzzyMatcher, itemToString, items, strictMatcher])

  /**
   * search for items based on the search term
   */
  return useMemo(() => {
    if (!query) return []

    try {
      return [
        ...new Set([
          // filter out special characters bc flexsearch doesn't handle them well
          ...strictMatcher.search(query.replaceAll(/[^\d A-Za-z]/g, " ")),
          ...fuzzyMatcher.search(query.replaceAll(/[^\d A-Za-z]/g, " ")),
        ]),
      ]
    } catch (error) {
      console.error(error)
      return []
    }
  }, [fuzzyMatcher, query, strictMatcher])
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean)
}
