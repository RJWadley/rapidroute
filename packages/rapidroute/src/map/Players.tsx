import { startTransition, useEffect, useState } from "react"

import { Player, WorldInfo } from "map/worldInfoType"

import MapPlayer from "./Player"

export default function MapPlayers() {
  const [players, setPlayers] = useState<Player[]>([])

  useEffect(() => {
    let isMounted = true

    const updatePlayers = () => {
      fetch(
        "https://cors.mrtrapidroute.com/?https://dynmap.minecartrapidtransit.net/standalone/dynmap_new.json"
      )
        .then(response => response.json())
        .then(async (data: WorldInfo) => {
          const newPlayers = data.players.filter(x => x.world === "new")
          startTransition(() => {
            if (isMounted) setPlayers(newPlayers)
          })
        })
        .catch(console.error)
    }

    updatePlayers()
    const interval = setInterval(updatePlayers, 5000)

    return () => {
      clearInterval(interval)
      isMounted = false
    }
  }, [])

  return (
    <>
      {players.map(player => (
        <MapPlayer key={player.name} player={player} />
      ))}
    </>
  )
}
