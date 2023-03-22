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

  const page = data?.query.pages[Object.keys(data.query.pages)[0]]

  return {
    data: page && "extract" in page ? page.extract : undefined,
    isLoading,
  }
}

export default useFirstParagraph
