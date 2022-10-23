import TSON from "typescript-json"

export interface SearchIndex {
  [key: string]: SearchIndexItem
}

export interface SearchIndexItem {
  /**
   * unique id of the item
   */
  uniqueId: string
  /**
   * display name of the item
   */
  d: string
  /**
   * search index for the item
   */
  i: string
}

export const isSearchIndexItem = (obj: unknown): obj is SearchIndexItem =>
  TSON.is<SearchIndexItem>(obj)
export const isWholeSearchIndex = (obj: unknown): obj is SearchIndex =>
  TSON.is<SearchIndex>(obj)
