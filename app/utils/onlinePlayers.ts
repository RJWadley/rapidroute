import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

const schema = z.object({
	players: z.array(
		z.object({
			world: z.string(),
			name: z.string(),
			x: z.number().transform((v) => Math.round(v)),
			z: z.number().transform((v) => Math.round(v)),
		}),
	),
})

export const getOnlinePlayers = async () => {
	const response = await fetch(
		"https://dynmap.minecartrapidtransit.net/main/standalone/dynmap_new.json?t=0",
	).then((res) => res.json())

	const { success, data, error } = schema.safeParse(response)

	if (success)
		return Object.fromEntries(
			data.players.map(
				(player) =>
					[
						`player-${player.name.toLowerCase()}` as const,
						{
							...player,
							id: `player-${player.name.toLowerCase()}`,
							type: "OnlinePlayer",
							position: `x${player.x}z${player.z}`,
							coordinates: [player.x, player.z],
						},
					] as const,
			),
		)

	console.warn("failed to parse online players", error)
	return {}
}

export type OnlinePlayer = Awaited<ReturnType<typeof getOnlinePlayers>>[string]

export const useOnlinePlayers = () => {
	return useQuery({
		queryKey: ["online-players"],
		queryFn: () => getOnlinePlayers(),
		refetchInterval: 5000,
		placeholderData: (previous) => previous,
	})
}
