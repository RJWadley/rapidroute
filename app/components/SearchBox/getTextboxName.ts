import type { Place } from "@prisma/client"

export const getTextboxName = (item: Partial<Place> | undefined) => {
  if (!item) return ""

  const code = item.IATA ?? item.placeCode

  return `${code ?? ""}${code ? " - " : ""}${item.name ?? item.id}`.trim()
}
