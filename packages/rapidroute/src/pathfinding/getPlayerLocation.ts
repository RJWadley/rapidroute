import { WorldInfo } from "map/worldInfoType"

export default function getPlayerLocation(player: string) {
  return fetch(
    "https://dynmap.minecartrapidtransit.net/main/standalone/dynmap_new.json"
  )
    .then(response => response.json())
    .then((data: WorldInfo) => {
      const playerInfo = data.players.find(p => p.name === player)

      if (playerInfo) {
        const { x, y, z, world } = playerInfo
        const location = { x, y, z, world }
        return location
      }

      return null
    })
}
