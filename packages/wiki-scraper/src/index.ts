import webscraper from "web-scraper-headless"

import skytrans from "./importers/skytrans.json"

const importers = {
  skytrans,
}

export default async function scrapeWiki(
  url: string,
  importer: keyof typeof importers
) {
  const sitemap = importers[importer]
  sitemap.startUrl = [url]

  const data = await webscraper(sitemap)

  data.flatMap(route => {
    const { fromName, toName, flightNumber, fromGate, toGate, isActive } = route

    const number = flightNumber?.match(/\d+/)?.[0]

    if (fromName && toName && number) {
      return {
        from: fromName,
        to: toName,
        number,
        fromGate: fromGate?.match(/\d/) ? fromGate : undefined,
        toGate: toGate?.match(/\d/) ? toGate : undefined,
        isActive: !!isActive,
      }
    }
    return []
  })
}
