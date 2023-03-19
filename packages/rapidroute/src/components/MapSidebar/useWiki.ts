/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { useAsync, useTimeout } from "react-use"

import { getTextboxName } from "data/search"
import { AllWikiImages } from "types/wiki/AllImages"
import { ExtractResponse } from "types/wiki/ExtractQuery"
import { WikiImage } from "types/wiki/ImageSearch"
import { WikiResponse } from "types/wiki/PageSearch"

export const WIKI_NO_CORS = "https://wiki.minecartrapidtransit.net/"
export const WIKI_URL = `https://cors.mrtrapidroute.com/?${WIKI_NO_CORS}`

/**
 * use the MediaWiki API to search for a page on the wiki and return the first paragraph.
 * If the page doesn't exist, we'll search for a similar page and return that instead.
 * @param searchTerm the search term to use
 */
export default function useWiki(idToSearch: string) {
  const searchTerm =
    getTextboxName(idToSearch).split("-").slice(1).join("-") ?? idToSearch
  const search = useAsync(async () => {
    if (!searchTerm) return

    const specificParams = {
      action: "query",
      list: "search",
      srwhat: "nearmatch",
      srsearch: searchTerm,
      format: "json",
    }

    const specificUrl = `${WIKI_URL}api.php?${new URLSearchParams(
      specificParams
    ).toString()}`
    const response: Response = await fetch(specificUrl)
    const specificResults = (await response.json()) as WikiResponse

    if (specificResults.query.search.length > 0) {
      const result = specificResults.query.search[0]
      const blurb = await getFirstParagraph(result.title)
      const images = await getImages(result.title)
      return {
        title: result.title,
        images,
        pageUrl: `${WIKI_NO_CORS}/index.php/${result.title}`,
        blurb,
      }
    }

    const genericParams = {
      ...specificParams,
      srwhat: "text",
    }
    const url = `${WIKI_URL}api.php?${new URLSearchParams(
      genericParams
    ).toString()}`
    const genericResponse = await fetch(url)
    const genericResults = (await genericResponse.json()) as WikiResponse

    if (genericResults.query.search.length > 0) {
      const result = genericResults.query.search[0]
      const blurb = await getFirstParagraph(result.title)
      return {
        title: result.title,
        pageUrl: `${WIKI_NO_CORS}index.php/${result.title}`,
        blurb,
      }
    }

    return undefined
  }, [searchTerm])

  useTimeout(3000)

  return search
}

const getFirstParagraph = async (text: string) => {
  const getParagraphParams = {
    format: "json",
    action: "query",
    prop: "extracts",
    exlimit: "max",
    explaintext: "",
    exintro: "",
    titles: text,
    redirects: "",
  }

  const getParagraphUrl = `${WIKI_URL}api.php?${new URLSearchParams(
    getParagraphParams
  ).toString()}`

  const response = await fetch(getParagraphUrl)
  const result = (await response.json()) as ExtractResponse

  const page = result.query.pages[Object.keys(result.query.pages)[0]]
  return "extract" in page ? page.extract : undefined
}

const getImages = async (pageTitle: string) => {
  const getAllImagesParams = {
    format: "json",
    action: "query",
    prop: "images",
    imlimit: "max",
    titles: pageTitle,
    redirects: "",
  }

  const getAllImagesUrl = `${WIKI_URL}api.php?${new URLSearchParams(
    getAllImagesParams
  ).toString()}`
  const response = await fetch(getAllImagesUrl)
  const result = (await response.json()) as AllWikiImages

  const page = result.query.pages[Object.keys(result.query.pages)[0]]
  const images = "images" in page ? page.images : []

  const promises = images
    .filter(im => im.title.match(/\.(jpg|jpeg|png|gif|webp)$/))
    .filter(
      // filter out flags, highway signs, maps, and service indicators
      im =>
        !im.title
          .toLowerCase()
          .match(
            /(flag|highway|[ab]\d+|map|service|icon|blurail|intrarail|logo)/
          )
    )
    // only get the first 10 images
    .slice(0, 10)
    .map(async image => {
      const getOneImageParams = {
        format: "json",
        action: "query",
        titles: image.title,
        prop: "imageinfo",
        iiprop: "url",
        iiurlwidth: "400",
      }

      const getOneImageUrl = `${WIKI_URL}api.php?${new URLSearchParams(
        getOneImageParams
      ).toString()}`
      const imageResp = await fetch(getOneImageUrl)
      const data = (await imageResp.json()) as WikiImage

      const imagePage = data.query.pages[Object.keys(data.query.pages)[0]]

      return "imageinfo" in imagePage
        ? {
            img: imagePage.imageinfo[0].thumburl,
            alt: imagePage.title.replace("File:", "").replace(/\.\w+$/, ""),
          }
        : undefined
    })

  // unwrap the promises into an array of image urls
  const imageUrls = await Promise.all(promises)
  return imageUrls.flatMap(img => (img ? [img] : []))
}
