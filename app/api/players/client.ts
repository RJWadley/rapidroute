import { useQuery } from "@tanstack/react-query"
import { getOnlinePlayers } from "./online"

export const useOnlinePlayers = () => {
	return useQuery({
		queryKey: ["online-players"],
		queryFn: async ({ client }) => {
			const onlinePlayers = await getOnlinePlayers()

			for (const player of Object.values(onlinePlayers)) {
				client.setQueryData(
					["online-player", player.username.toLowerCase()],
					player,
				)
			}

			return onlinePlayers
		},
		refetchInterval: 1000,
		placeholderData: (previous) => previous,
	})
}

export const useOnlinePlayer = (username: string | null | undefined) => {
	return useQuery({
		queryKey: ["online-player", username?.toLowerCase()],
		queryFn: async () => {
			if (!username) return null

			const onlinePlayers = await getOnlinePlayers()
			return onlinePlayers[`player-${username.toLowerCase()}`] ?? null
		},
	}).data
}
