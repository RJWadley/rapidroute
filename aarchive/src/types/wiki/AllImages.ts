// Generated by https://quicktype.io

export interface AllWikiImages {
  batchcomplete: string
  query: Query
  limits: Limits
}

export interface Limits {
  images: number
}

export interface Query {
  pages: Pages
}

export type Pages = Record<string, Missing | Found>

export interface Missing {
  ns: number
  title: string
  missing: string
}

export interface Found {
  pageid: number
  ns: number
  title: string
  images: Image[]
}

export interface Image {
  ns: number
  title: string
}
