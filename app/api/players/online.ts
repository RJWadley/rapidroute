import { z } from "zod"
import type { OnlinePlayer } from "./type"

const schema = z.object({
	players: z.array(
		z.object({
			world: z.string().transform((v) => {
				switch (v) {
					case "new":
						return "New"
					case "old":
						return "Old"
					case "space":
						return "Space"
					default:
						return "Unknown"
				}
			}),
			name: z.string(),
			x: z.number().transform((v) => Math.round(v)),
			y: z.number().transform((v) => Math.round(v)),
			z: z.number().transform((v) => Math.round(v)),
		}),
	),
})

export const getOnlinePlayers = async (): Promise<
	Record<string, OnlinePlayer>
> => {
	const response = await fetch(
		"https://dynmap.minecartrapidtransit.net/main/standalone/dynmap_new.json?t=0",
	).then((res) => res.json())

	const { success, data, error } = schema.safeParse(response)

	if (success)
		return Object.fromEntries(
			data.players.map(
				(player) =>
					[
						`player-${player.name.toLowerCase()}`,
						{
							...player,
							username: player.name,
							type: "Player",
							isOnline: true,
							positionForRouting: `x${player.x}z${player.z}`,
							id: `player-${player.name.toLowerCase()}`,
						} satisfies OnlinePlayer,
					] as const,
			),
		)

	console.error("failed to parse online players", error)
	return {}
}
