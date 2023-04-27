import { z } from "zod"

/**
 * bare minimum information needed to search for places
 */
export const searchIndexItemSchema = z.object({
  /**
   * unique id of the item
   */
  uniqueId: z.string(),
  /**
   * display name of the item
   */
  d: z.string(),
  /**
   * search index for the item
   */
  i: z.string(),
})

export const searchIndexSchema = z.record(searchIndexItemSchema)

export type SearchIndexItem = z.TypeOf<typeof searchIndexItemSchema>
export type SearchIndex = z.TypeOf<typeof searchIndexSchema>

export const isSearchIndexItem = (obj: unknown): obj is SearchIndexItem =>
  searchIndexItemSchema.safeParse(obj).success
export const isWholeSearchIndex = (obj: unknown): obj is SearchIndex =>
  searchIndexSchema.safeParse(obj).success
