import type { RouteType } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"

import { findPath } from "./findPath"

export const usePath = (
	from: { id: string } | null | undefined,
	to: { id: string } | null | undefined,
	allowedModes: RouteType[],
) => {
	const { data, isLoading } = useQuery({
		queryKey: ["path", from, to, ...allowedModes],
		queryFn: () => from && to && findPath(from.id, to.id, allowedModes),
	})

	return { results: data, isRouting: isLoading }
}
