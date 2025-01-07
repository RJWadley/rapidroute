import { useOnlinePlayers } from "app/utils/onlinePlayers"
import MapPlayer from "./Player"

export default function MapPlayers() {
	const { data: onlinePlayers } = useOnlinePlayers()

	if (!onlinePlayers) return null

	const players = Object.values(onlinePlayers)

	return (
		<>
			{players.map((player) => (
				<MapPlayer key={player.name} player={player} />
			))}
		</>
	)
}
