import { useQuery } from "@tanstack/react-query"
import { AllWikiImages } from "types/wiki/AllImages"
import { WikiImage } from "types/wiki/ImageSearch"

import { WIKI_URL } from "./urls"

const useImages = (pageTitle: string | undefined) => {
  const getAllImagesParams = {
    format: "json",
    action: "query",
    prop: "images",
    imlimit: "max",
    titles: pageTitle ?? "",
    redirects: "",
  }
  const getAllImagesUrl = `${WIKI_URL}api.php?${new URLSearchParams(
    getAllImagesParams
  ).toString()}`

  const { data: result } = useQuery<AllWikiImages>({
    queryKey: [getAllImagesUrl],
    enabled: !!pageTitle,
  })

  const pageKey = Object.keys(result?.query.pages ?? {})[0]
  const page = pageKey ? result?.query.pages[pageKey] : undefined
  const images = page && "images" in page ? page.images : undefined

  const { data, isLoading } = useQuery({
    queryKey: images?.map(im => im.title),
    enabled: !!images,
    queryFn: async ({ signal }) => {
      if (!images) return []
      const imagePromises = images
        .filter(im => im.title.match(/\.(jpg|jpeg|png|gif|webp)$/))
        .filter(
          // filter out flags, highway signs, maps, and service indicators
          im =>
            !/(flag|highway|[ab]\d+|map|service|icon|blurail|intrarail|logo)/.test(
              im.title.toLowerCase()
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
          const imageResp = await fetch(getOneImageUrl, { signal })
          // TODO -next-line @typescript-eslint/consistent-type-assertions
          const imageData = (await imageResp.json()) as WikiImage

          const imagePageKey = Object.keys(imageData.query.pages)[0]
          const imagePage = imagePageKey
            ? imageData.query.pages[imagePageKey]
            : undefined

          return imagePage && "imageinfo" in imagePage
            ? {
                img: imagePage.imageinfo[0]?.thumburl,
                alt: imagePage.title.replace("File:", "").replace(/\.\w+$/, ""),
              }
            : null
        })

      // unwrap the promises into an array of image urls
      const imageUrls = await Promise.all(imagePromises)
      return imageUrls.flatMap(img => (img ? [img] : []))
    },
  })

  return { data, isLoading: isLoading && !!images }
}

export default useImages
