import TSON from "typescript-json"

export type AutoGenIndex = {
  [key: string]: {
    routes?: string[]
    locations?: string[]
    providers?: string[]
  }
}

export const isAutoGenIndex = (value: unknown): value is AutoGenIndex[string] =>
  TSON.is<AutoGenIndex[string]>(value)
export const isWholeAutoGenIndex = (value: unknown): value is AutoGenIndex =>
  TSON.is<AutoGenIndex>(value)
