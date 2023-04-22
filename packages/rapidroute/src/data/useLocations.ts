import { Location } from "@rapidroute/database-types"
import { useQuery } from "@tanstack/react-query"

import { getPath } from "./getData"

export default function useLocations(names: string[]) {
  const { data: locations } = useQuery({
    queryKey: ["locations", ...names],
    keepPreviousData: true,
    queryFn: () => {
      return Promise.all(names.map(name => getPath("locations", name)))
    },
  })
  if (!locations) return

  // transform locations into a map
  const locationsMap: Record<string, Location> = {}

  for (const location of locations) {
    if (location) locationsMap[location.name] = location
  }

  return locationsMap
}
