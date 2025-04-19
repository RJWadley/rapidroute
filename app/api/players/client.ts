import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "../trpc/client"

export const useOnlinePlayers = () => {
	const trpc = useTRPC()
	return useQuery(
		trpc.onlinePlayers.queryOptions(undefined, {
			refetchInterval: 1000,
			placeholderData: (previous) => previous,
		}),
	)
}
