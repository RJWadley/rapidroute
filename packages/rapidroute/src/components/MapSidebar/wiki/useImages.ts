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

  const page = result?.query.pages[Object.keys(result.query.pages)[0]]
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
          const imageResp = await fetch(getOneImageUrl, { signal })
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          const imageData = (await imageResp.json()) as WikiImage

          const imagePage =
            imageData.query.pages[Object.keys(imageData.query.pages)[0]]

          return "imageinfo" in imagePage
            ? {
                img: imagePage.imageinfo[0].thumburl,
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
