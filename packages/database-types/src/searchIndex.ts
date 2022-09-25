export interface SearchIndex {
  [key: string]: Partial<SearchIndexItem>
}

interface SearchIndexItem {
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
