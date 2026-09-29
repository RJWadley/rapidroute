import { useQuery } from "@tanstack/react-query"
import type { Logos } from "app/data/logos"

export const useLogos = () =>
	useQuery({
		queryKey: ["logos"],
		queryFn: () =>
			fetch("/api/logos").then((res) => res.json() as Promise<Logos>),
		staleTime: Number.POSITIVE_INFINITY,
	}).data
