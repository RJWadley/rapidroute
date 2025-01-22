import { useOnlinePlayers, type OnlinePlayer } from "app/utils/onlinePlayers"
import MapPlayer from "./Player"
import { useEffect, useState } from "react"

export default function MapPlayers() {
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
					key={player.name}
					player={player}
					isOnline={player.id in onlinePlayers}
				/>
			))}
		</>
	)
}
