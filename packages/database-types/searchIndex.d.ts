export interface SearchIndex {
  [key: string]: {
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
}
