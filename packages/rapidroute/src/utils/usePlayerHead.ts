import { useQuery } from "@tanstack/react-query"

import { MojangUUIDResponse } from "types/Mojang"

export default function usePlayerHead(name: string | undefined) {
  const { data: mojangResponse, isLoading } = useQuery<MojangUUIDResponse>({
    queryKey: [
      `https://cors.mrtrapidroute.com/?https://api.mojang.com/users/profiles/minecraft/${
        name ?? ""
      }`,
    ],
    enabled: !!name,
  })

  const uuid = mojangResponse?.id
  if (isLoading && name) return
  return uuid
    ? `https://mineskin.eu/helm/${uuid}`
    : "https://mineskin.eu/avatar/steve"
}
