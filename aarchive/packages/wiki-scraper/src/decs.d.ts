declare module "web-scraper-headless" {
  export interface SiteMap {
    _id: string
    startUrl: string[]
    selectors: Selector[]
  }

  export interface Selector {
    id: string
    multiple: boolean
    parentSelectors: string[]
    regex?: string
    selector: string
    type: string
  }

  export interface Options {
    delay?: number
    pageLoadDelay?: number
    browser?: "headless"
  }

  export interface ReturnType {
    fromName: string | null
    fromGate: null | string
    toName: null | string
    toGate: null | string
    flightNumber: null | string
    isActive: string | null
  }

  export default function webscraper(
    sitemap: SiteMap,
    options?: Options
  ): Promise<ReturnType[]>
}
