import { useQuery } from "@tanstack/react-query"
import styled, { keyframes } from "styled-components"

import { InfoBoxType } from "types/wiki/InfoBox"
import { isBrowser } from "utils/functions"

import { WIKI_NO_CORS, WIKI_URL } from "./useWiki"

export default function InfoBox({ title }: { title: string }) {
  const pageParams = {
    action: "parse",
    page: title,
    format: "json",
    redirects: "",
  }
  const url = `${WIKI_URL}api.php?${new URLSearchParams(pageParams).toString()}`

  const { data, isLoading } = useQuery<InfoBoxType>({
    queryKey: [url],
  })

  if (isLoading) return <Loading />
  if (!data) return null

  const html = parseInfoBox(data)

  return <Wrapper dangerouslySetInnerHTML={{ __html: html ?? "" }} />
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
  const twoThs = Array.from(newBox?.querySelectorAll("tr") ?? []).filter(
    tr =>
      tr.querySelectorAll("th").length === 2 &&
      tr.querySelector("th")?.textContent?.trim() === "ft" &&
      tr.querySelectorAll("th")[1]?.textContent?.trim() === "m"
  )
  twoThs.forEach(tr => tr.classList.add("feetAndMeters"))

  // make sure URLs are valid
  const boxText = newBox?.outerHTML
    .replaceAll('src="/', `src="${WIKI_NO_CORS}`)
    .replaceAll('href="/', `href="${WIKI_NO_CORS}`)
    .replaceAll("{{{subtextcolor}}}", "var(--default-text)")
    // split apart any srcset attributes, upgrade the src, and rejoin them
    .replaceAll(/srcset="(.*?)"/g, (match: string, p1: string) => {
      const srcset = p1
        .split(",")
        .map(src => src.trim())
        .map(src => {
          const [imageURL, size] = src.split(" ")
          return `${WIKI_NO_CORS}${imageURL} ${size}
                `
        })
        .join(",")
      return `srcset="${srcset}"`
    })

  return boxText
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
  padding: 20px;

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
  }

  td,
  th {
    flex: 1;
    padding: 5px 10px;
    border: none !important;
    border-radius: 10px;
  }

  .infobox-header {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: var(--small);
    font-weight: bold;
    color: #111;
  }

  .infobox-above {
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
    border-radius: 8px;
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
  }

  .infobox-image > a {
    background: #f8f9fa;
    padding: 5px 5px 1px;
    border-radius: 8px;
  }

  .thumbimage img {
    object-fit: cover;
  }

  /* service markers should be small and transparent (WN25) */
  img[src*="Service"] {
    width: unset !important;
    background: unset !important;
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
  & *[style*="background"] {
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
`
