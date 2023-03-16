/* eslint-disable react/no-danger */
import { useAsync } from "react-use"
import styled from "styled-components"

import { isBrowser } from "utils/functions"

import { WIKI_URL } from "./useWiki"

export default function InfoBox({ title }: { title: string }) {
  const { value } = useInfoBox(title)
  return <Wrapper dangerouslySetInnerHTML={{ __html: value ?? "" }} />
}

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
    padding: 5px;
    border-radius: 5px;
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
    background: #eee;
  }

  .thumbimage img {
    object-fit: cover;
  }

  .infobox-data {
    line-height: 1.5em;
  }

  * {
    max-width: 100% !important;
    width: unset;
    height: unset;
  }

  /* fix default color for MRT stops */
  .infobox-data span[style*="background"] {
    color: black;
  }

  a:hover {
    text-decoration: underline;
  }

  a.selflink:hover {
    text-decoration: none;
  }
`

const useInfoBox = (title: string) => {
  return useAsync(async () => {
    if (!isBrowser()) return
    const pageParams = {
      action: "parse",
      page: title,
      format: "json",
    }
    const url = `${WIKI_URL}api.php?${new URLSearchParams(
      pageParams
    ).toString()}`

    const response = await fetch(url)
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const data = (await response.json()) as InfoBoxType

    // parse the text as HTML
    const parser = new DOMParser()
    const html = parser.parseFromString(data.parse.text["*"], "text/html")

    // get the infobox element
    const newBox = html.querySelector(".infobox")

    return (
      newBox?.outerHTML
        .replaceAll('src="/', `src="${WIKI_URL}`)
        .replaceAll('href="/', `href="${WIKI_URL}`)
        .replaceAll("{{{subtextcolor}}}", "var(--default-text)")
        // split apart any srcset attributes, upgrade the src, and rejoin them
        .replaceAll(/srcset="(.*?)"/g, (match: string, p1: string) => {
          const srcset = p1
            .split(",")
            .map(src => src.trim())
            .map(src => {
              const [imageURL, size] = src.split(" ")
              return `${WIKI_URL}${imageURL} ${size}
          `
            })
            .join(",")
          return `srcset="${srcset}"`
        })
    )
  }, [title])
}

// Generated by https://quicktype.io

export interface InfoBoxType {
  parse: Parse
}

export interface Parse {
  title: string
  pageid: number
  revid: number
  text: Text
  langlinks: unknown[]
  categories: Category[]
  links: Link[]
  templates: Link[]
  images: string[]
  externallinks: unknown[]
  sections: unknown[]
  parsewarnings: unknown[]
  displaytitle: string
  iwlinks: unknown[]
  properties: Property[]
}

export interface Category {
  sortkey: string
  "*": string
}

export interface Link {
  ns: number
  exists: string
  "*": string
}

export interface Property {
  name: string
  "*": string
}

export interface Text {
  "*": string
}
