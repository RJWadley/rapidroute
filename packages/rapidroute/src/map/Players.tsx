import { useQuery } from "@tanstack/react-query"

import { WorldInfo } from "map/worldInfoType"

import MapPlayer from "./Player"

export default function MapPlayers() {
  const { data } = useQuery<WorldInfo>({
    queryKey: [
      "https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json",
    ],
    refetchInterval: 5000,
  })
  const players = data?.players.filter(x => x.world === "new") ?? []

  return (
    <>
      {players.map(player => (
        <MapPlayer key={player.name} player={player} />
      ))}
    </>
  )
}
