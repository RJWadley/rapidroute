import { useQuery } from "@tanstack/react-query"

import { MojangUUIDResponse } from "types/Mojang"

const fallbackUUID = "ec561538-f3fd-461d-aff5-086b22154bce"

export default function usePlayerHead(name: string | undefined) {
  const { data: mojangResponse, isLoading } = useQuery<MojangUUIDResponse>({
    queryKey: [
      `https://cors.mrtrapidroute.com/?https://api.mojang.com/users/profiles/minecraft/${
        name ?? ""
      }`,
    ],
    enabled: !!name,
  })

  const uuid = mojangResponse?.id ?? fallbackUUID
  if (isLoading && name) return
  return `https://crafatar.com/avatars/${uuid}?overlay`
}
