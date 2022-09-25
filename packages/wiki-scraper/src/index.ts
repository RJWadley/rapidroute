import webscraper from "web-scraper-headless"

import skytrans from "./importers/skytrans.json"
import { search } from "./searchForId"

const importers = {
  skytrans,
}

export default async function scrapeWiki(
  importer: keyof typeof importers,
  url?: string
) {
  const sitemap = importers[importer]
  if (url) sitemap.startUrl = [url]

  const rawData = await webscraper(sitemap)

  const dataWithProms = rawData.map(async route => {
    const { fromName, toName, flightNumber, fromGate, toGate, isActive } = route

    const number = flightNumber?.match(/\d+/)?.[0]

    if (fromName && toName && number) {
      const from = await search(fromName)
      const to = await search(toName)

      return {
        from,
        to,
        number,
        fromGate: fromGate?.match(/\d/) ? fromGate : undefined,
        toGate: toGate?.match(/\d/) ? toGate : undefined,
        isActive: !!isActive,
      }
    }
    return []
  })

  const data = await Promise.all(dataWithProms)

  return data.flat()
}
