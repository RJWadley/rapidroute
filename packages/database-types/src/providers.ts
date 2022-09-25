import TSON from "typescript-json"

export interface Providers {
  [key: string]: Provider
}

export interface Provider {
  /**
   * should match the database key
   */
  uniqueId: string
  /**
   * The display name of the provider
   */
  name: string
  /**
   * route numbers are sometimes prefixed with a code
   */
  numberPrefix?: string
  /**
   * optionally, a description of the provider
   */
  description?: string
  /**
   * URL to the provider's logo
   */
  logo: string
  /**
   * accent color for the provider
   */
  color: Color
  /**
   * owner or owners of the provider
   */
  ownerPlayer?: string | string[]
  /**
   * if this provider is a codeshare for another provider,
   * this provides information about that relationship
   */
  alias?: Alias[]
  /**
   * true if the content of this provider can be overwritten automatically
   */
  autoGenerated: boolean
}

/**
 * Information about a provider alias relationship
 */
export interface Alias {
  /**
   * which provider this is an alias for
   */
  displayProvider: string
  /**
   * under which numbers this provider is known as an alias
   */
  numberRange: NumberRange
}

/**
 * a number range, e.g. 1-10, 1-10, 20-30
 */
export interface NumberRange {
  /**
   * lower bound of the range
   */
  start: string
  /**
   * upper bound of the range
   * can match the start value to indicate a single number
   */
  end: string
}

/**
 * a pair of colors, one light and one dark
 */
export interface Color {
  /**
   * light color, e.g. for use as a background in light mode
   */
  light: string
  /**
   * dark color, e.g. for use as a background in dark mode
   */
  dark: string
}

export const isProvider = (obj: unknown): obj is Provider =>
  TSON.is<Provider>(obj)
