import { useQuery } from "@tanstack/react-query"
import { ExtractResponse } from "types/wiki/ExtractQuery"

import { WIKI_URL } from "./urls"

const useFirstParagraph = (text: string | undefined) => {
  const paragraphParams = {
    format: "json",
    action: "query",
    prop: "extracts",
    exlimit: "max",
    explaintext: "",
    exintro: "",
    titles: text ?? "",
    redirects: "",
  }
  const paragraphUrl = `${WIKI_URL}api.php?${new URLSearchParams(
    paragraphParams
  ).toString()}`

  const { data, isLoading } = useQuery<ExtractResponse>({
    queryKey: [paragraphUrl],
    enabled: !!text,
  })

  const pageKey = Object.keys(data?.query.pages ?? {})[0]
  const page = pageKey ? data?.query.pages[pageKey] : undefined

  return {
    data: page && "extract" in page ? page.extract : undefined,
    isLoading: isLoading && !!text,
  }
}

export default useFirstParagraph
