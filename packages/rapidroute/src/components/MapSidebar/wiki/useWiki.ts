import { useQuery } from "@tanstack/react-query"

import { getTextboxName } from "data/search"
import { WikiResponse } from "types/wiki/PageSearch"

import { WIKI_NO_CORS, WIKI_URL } from "./urls"
import useFirstParagraph from "./useFirstParagraph"
import useImages from "./useImages"

/**
 * use the MediaWiki API to search for a page on the wiki and return the first paragraph.
 * If the page doesn't exist, we'll search for a similar page and return that instead.
 * @param searchTerm the search term to use
 */
export default function useWiki(idToSearch: string | undefined) {
  const searchTerm =
    idToSearch &&
    (getTextboxName(idToSearch)
      .split("-")
      .slice(1)
      .join("-")
      // this is for u, kanto
      .replaceAll(/Terminal ?\d?/g, "")
      .trim() ??
      idToSearch)

  const specificParams = {
    action: "query",
    list: "search",
    srwhat: "nearmatch",
    srsearch: searchTerm ?? "",
    format: "json",
  }
  const specificUrl = `${WIKI_URL}api.php?${new URLSearchParams(
    specificParams
  ).toString()}`
  const genericParams = {
    ...specificParams,
    srwhat: "text",
  }
  const genericUrl = `${WIKI_URL}api.php?${new URLSearchParams(
    genericParams
  ).toString()}`

  const { data: specificResults, isLoading: specificLoading } =
    useQuery<WikiResponse>({
      queryKey: [specificUrl],
      enabled: !!searchTerm,
    })
  const { data: genericResults, isLoading: genericLoading } =
    useQuery<WikiResponse>({
      queryKey: [genericUrl],
      enabled: !!searchTerm && !specificLoading,
    })

  const genericResult = genericResults?.query.search[0]
  const specificResult = specificResults?.query.search[0]

  const result = specificResult ?? genericResult

  const { data: blurb, isLoading: blurbLoading } = useFirstParagraph(
    result?.title
  )
  const { data: images, isLoading: imagesLoading } = useImages(result?.title)

  const contentLoading =
    searchTerm &&
    (specificLoading || genericLoading || blurbLoading || imagesLoading)

  if (!result?.title && !contentLoading)
    return {
      loading: false,
      value: undefined,
    }
  return {
    loading: contentLoading,
    value: {
      title: result?.title,
      images,
      pageUrl: `${WIKI_NO_CORS}/index.php/${result?.title ?? ""}`,
      blurb,
    },
  }
}
