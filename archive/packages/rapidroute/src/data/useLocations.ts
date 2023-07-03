import { Place } from "@rapidroute/database-utils"
import { useQuery } from "@tanstack/react-query"

import { getPath } from "./getData"

export default function usePlaces(names: string[]) {
  const { data: locations } = useQuery({
    queryKey: ["locations", ...names],
    keepPreviousData: true,
    queryFn: () => {
      return Promise.all(names.map(name => getPath("places", name)))
    },
  })
  if (!locations) return

  // transform locations into a map
  const locationsMap: Record<string, Place> = {}

  for (const location of locations) {
    if (location) locationsMap[location.name] = location
  }

  return locationsMap
}
