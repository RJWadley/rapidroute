// TODO /*  max-lines */
// TODO /*  react-hooks/exhaustive-deps */
// TODO /*  no-param-reassign */
import { useQuery } from "@tanstack/react-query"
import { darkModeContext } from "components/Providers/DarkMode"
import { gsap } from "gsap"
import { useContext } from "react"
import styled, { keyframes } from "styled-components"
import { InfoBoxType } from "types/wiki/InfoBoxType"
import { isBrowser } from "utils/functions"
import { rgb2hex } from "utils/hslToHex"
import invertLightness, { hexToHSL } from "utils/invertLightness"
import useAnimation from "utils/useAnimation"

import { WIKI_NO_CORS, WIKI_URL } from "./urls"

export default function InfoBox({ title }: { title: string | undefined }) {
  const pageParams = {
    action: "parse",
    page: title ?? "",
    format: "json",
    redirects: "",
  }
  const url = `${WIKI_URL}api.php?${new URLSearchParams(pageParams).toString()}`

  const { data, isLoading } = useQuery<InfoBoxType>({
    queryKey: [url],
    enabled: !!title,
  })

  const isDark = useContext(darkModeContext)

  // because we need computed styles, we have to do text color inversion in an effect
  useAnimation(() => {
    const allChildren = [
      ...document.querySelectorAll(
        ".infobox-wrap tr > * > *, .infobox-wrap tr > * > *:not([style*='background']) > *:not([style*='background'])"
      ),
    ].flatMap(child => (child instanceof HTMLElement ? [child] : []))
    // filter out any children with a background color
    const noBackgrounds = allChildren.filter(
      child => !child.style.backgroundColor
    )
    noBackgrounds.forEach(child => {
      // get the computed text color
      const { color } = window.getComputedStyle(child)
      const asHex = rgb2hex(color)

      // get the lightness
      const lightness = hexToHSL(asHex)[2]

      if (lightness) {
        if (isDark && lightness < 0.51) {
          gsap.set(child, { color: invertLightness(asHex) })
        }
        if (!isDark && lightness > 0.5) {
          gsap.set(child, { color: invertLightness(asHex) })
        }
      }
    })
  }, [isDark, data])

  if (!title) return null
  if (isLoading) return <Loading />
  if (!data) return null

  const html = parseInfoBox(data)

  return (
    <Wrapper
      className="infobox-wrap"
      dangerouslySetInnerHTML={{ __html: html ?? "" }}
    />
  )
}

const parseInfoBox = (data: InfoBoxType) => {
  if (!isBrowser()) return
  // parse the text as HTML
  const parser = new DOMParser()
  const html = parser.parseFromString(data.parse.text["*"], "text/html")
  const newBox = html.querySelector(".infobox")

  // find any trs with exactly two ths, where the first th says ft and the second m
  // add the feetAndMeters class to that tr
  // this is for airports that list runway lengths
  const twoThs = [...(newBox?.querySelectorAll("tr") ?? [])].filter(
    tr =>
      tr.querySelectorAll("th").length === 2 &&
      tr.querySelector("th")?.textContent?.trim() === "ft" &&
      tr.querySelectorAll("th")[1]?.textContent?.trim() === "m"
  )
  twoThs.forEach(tr => tr.classList.add("feetAndMeters"))

  // find any images with width less than 50px and add the small-image class
  const smallImages = [...(newBox?.querySelectorAll("img") ?? [])].filter(
    img => img.width < 50
  )
  smallImages.forEach(img => img.classList.add("small-image"))

  // find any hanging text nodes on .infobox-image and convert them to divs with the class .infobox-caption
  const infoboxImages = [...(newBox?.querySelectorAll(".infobox-image") ?? [])]
  infoboxImages.forEach(image => {
    const children = [...image.childNodes]
    children.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const div = document.createElement("div")
        div.classList.add("infobox-caption")
        div.textContent = child.textContent ?? ""
        child.parentNode?.replaceChild(div, child)
      }
    })
  })

  return (
    newBox?.outerHTML
      // fix colors and change the default background
      .replaceAll("{{{subtextcolor}}}", "var(--default-text)")
      .replaceAll("#ccf", "#ddd")
      // make sure URLs are valid
      .replaceAll('src="/', `src="${WIKI_NO_CORS}`)
      .replaceAll('href="/', `href="${WIKI_NO_CORS}`)
      // split apart any srcset attributes, upgrade the src, and rejoin them
      .replaceAll(/srcset="(.*?)"/g, (match: string, p1: string) => {
        const srcset = p1
          .split(",")
          .map(src => src.trim())
          .map(src => {
            const [imageURL, size] = src.split(" ")
            return imageURL && size
              ? `${WIKI_NO_CORS}${imageURL} ${size}
                `
              : ""
          })
          .join(",")
        return `srcset="${srcset}"`
      })
  )
}

const pulse = keyframes`
  0% {
    background-position: 40% 0;
  }
  100% {
    background-position: -160% 0;
  }
`

const Loading = styled.div`
  background: linear-gradient(
    to right,
    var(--default-card-background) 0%,
    var(--dark-background) 10%,
    var(--default-card-background) 20%
  );
  background-size: 200% 100%;
  animation: ${pulse} 2s ease infinite;
  border-radius: 20px;
  transition: opacity 0.5s;
  pointer-events: none;
  margin-top: 20px;
  height: 100px;
`

const Wrapper = styled.div`
  padding: 0 20px 20px;

  :empty {
    display: none;
  }

  /* clear table styles */
  table,
  tbody,
  tr,
  td,
  th {
    display: block;
  }

  tr {
    display: flex;
    gap: 10px;
  }
  *[style*="table-row"] {
    display: flex !important;
    gap: 10px;
  }

  td,
  th,
  *[style*="table-cell"] {
    flex: 1;
    padding: 5px 0;
    border: none !important;
    border-radius: 10px;
  }

  .infobox-header {
    margin: 20px -20px 10px;
    width: calc(100% + 40px) !important;
    max-width: calc(100% + 40px) !important;
    padding: 10px 18px;
    border-radius: 0;
    font-size: var(--small);
    font-weight: bold;
    color: black;
    background: #ddd;
  }

  // hide the top title rows
  .infobox-above,
  .infobox-subheader {
    display: none;
  }

  .infobox-image {
    display: grid;
    gap: 5px;

    * {
      width: 100% !important;
    }
  }

  .infobox-caption {
    color: var(--low-contrast-text);
    background: var(--mid-background);
    padding: 5px 10px;
    border-radius: 10px;
    margin-bottom: 10px;
  }

  .trow {
    display: flex;
    margin-top: 5px;
    gap: 5px;
  }

  img {
    width: 100% !important;
    object-fit: contain;
    border-radius: 5px;
    background: #f8f9fa;
    padding: 5px;
  }

  .infobox-image img {
    border-radius: 20px;
  }

  .thumbimage img {
    object-fit: cover;
    border-radius: 10px;
    padding: 2px;
  }

  /* tiny images should be small and transparent (WN25, Sunshine Coast) */
  .small-image {
    width: unset !important;
    height: 20px;
    background: unset;
    padding: unset;
    transform: translate(0, 4px);
  }

  .infobox-data {
    line-height: 1.5em;
  }

  * {
    max-width: 100% !important;
    width: unset;
    height: unset;
  }

  /* fix default color for stuff with backgrounds */
  &
    *[style*="background"]:not(.infobox-header):not(
      [style*="background:none"]
    ) {
    color: black;
  }

  tr[style*="background"] {
    margin: 5px;
    border-radius: 5px;
  }

  a:hover {
    text-decoration: underline;
  }

  a.selflink:hover {
    text-decoration: none;
  }

  .feetAndMeters {
    width: 50%;
    margin-left: 25% !important;
    background: var(--mid-background) !important;
    color: var(--low-contrast-text) !important;
  }

  sup {
    display: inline-block;
    font-size: 0.5em;
    transform: translateY(-0.5em);
  }

  sub {
    font-size: 0.5em;
  }

  .infobox-image br {
    display: none;
  }

  .infobox-data a span {
    white-space: nowrap;
    display: inline-block;
    margin-bottom: 2px;
  }
`
