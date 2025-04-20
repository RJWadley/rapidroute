import type { OnlinePlayer } from "app/api/players/type"
import MapPlayer from "./Player"
import { useEffect, useState } from "react"
import { useOnlinePlayers} from "app/api/players/client"

export default function MapPlayers() {
	// temporary workaround for pixi animation
	const [allTimePlayers, setAllTimePlayers] = useState<OnlinePlayer[]>([])
	const { data: onlinePlayers } = useOnlinePlayers()

	useEffect(() => {
		if (!onlinePlayers) return

		setAllTimePlayers((p) =>
			[...p, ...Object.values(onlinePlayers)].filter(
				(player, i, arr) => arr.findIndex((x) => x.id === player.id) === i,
			),
		)
	}, [onlinePlayers])

	if (!onlinePlayers) return null
	return (
		<>
			{allTimePlayers.map((player) => (
				<MapPlayer
					key={player.username}
					player={player}
					isStillOnline={onlinePlayers[player.id]?.isOnline ?? false}
				/>
			))}
		</>
	)
}
