import { useQuery } from "@tanstack/react-query"
import type { Logos } from "app/data/logos"

export const useLogos = () =>
	useQuery({
		queryKey: ["logos"],
		queryFn: async () => {
			const response = await fetch("/api/logos")
			if (!response.ok)
				throw new Error(`Logo request failed (${response.status})`)
			return response.json() as Promise<Logos>
		},
		staleTime: Number.POSITIVE_INFINITY,
	}).data
