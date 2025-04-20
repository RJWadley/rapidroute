import { useQuery } from "@tanstack/react-query"
import { getOnlinePlayers } from "./online"

export const useOnlinePlayers = () => {
	return useQuery({
		queryKey: ["online-players"],
		queryFn: getOnlinePlayers,
		refetchInterval: 1000,
		placeholderData: (previous) => previous,
	})
}

export const useOnlinePlayer = (username: string | null | undefined) => {
	const { data: allPlayers } = useOnlinePlayers()
	const player = allPlayers?.[username || ""]
	return player || null
}
