import { z } from "zod"

/**
 * a number range, e.g. 1-10, 1-10, 20-30
 */
export const numberRangeSchema = z.object({
  /**
   * lower bound of the range
   */
  start: z.string(),
  /**
   * upper bound of the range
   * can match the start value to indicate a single number
   */
  end: z.string(),
})

/**
 * a pair of colors, one light and one dark
 */
export const colorSchema = z.object({
  /**
   * light color, e.g. for use as a background in light mode
   */
  light: z.string(),
  /**
   * dark color, e.g. for use as a background in dark mode
   */
  dark: z.string(),
})

/**
 * Information about a provider alias relationship
 */
export const aliasSchema = z.object({
  /**
   * which provider this is an alias for
   */
  displayProvider: z.string(),
  /**
   * under which numbers this provider is should display the displayProvider
   */
  numberRange: numberRangeSchema,
})

/**
 * a provider is the owner of a route, e.g. an airline or a train company
 */
export const providerSchema = z.object({
  /**
   * should match the database key
   */
  uniqueId: z.string(),
  /**
   * The display name of the provider
   */
  name: z.string(),
  /**
   * route numbers are sometimes prefixed with a code
   */
  numberPrefix: z.string().optional(),
  /**
   * optionally, a description of the provider
   */
  description: z.string().optional(),
  /**
   * URL to the provider's logo
   */
  logo: z.string().optional(),
  /**
   * accent color for the provider
   */
  color: colorSchema.optional(),
  /**
   * owner or owners of the provider
   */
  ownerPlayer: z.union([z.string(), z.array(z.string())]).optional(),
  /**
   * if this provider is a codeshare for another provider,
   * this provides information about that relationship
   */
  alias: z.array(aliasSchema).optional(),
  /**
   * a list of keys that can't be overwritten automatically
   */
  manualKeys: z.array(z.string()).optional(),
})

export const providersSchema = z.record(providerSchema)

export type NumberRange = z.TypeOf<typeof numberRangeSchema>
export type Color = z.TypeOf<typeof colorSchema>
export type Alias = z.TypeOf<typeof aliasSchema>
export type Provider = z.TypeOf<typeof providerSchema>
export type Providers = z.TypeOf<typeof providersSchema>

export const isProvider = (obj: unknown): obj is Provider =>
  providerSchema.safeParse(obj).success
