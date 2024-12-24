import type { ExcludedRoutes } from "app/data"
import type { findPath } from "."

/**
 * find a path between two locations on the server-side
 */
export const findPathInServer = async (
	from: string | undefined | null,
	to: string | undefined | null,
	excludedRoutes: ExcludedRoutes,
) => {
	if (typeof window === "undefined") return null
	if (!from || !to) return null

	const options = {
		from,
		to,
		excludedRoutes: JSON.stringify(excludedRoutes),
	}

	const data = await fetch(
		`/pathing?${Object.entries(options)
			.map(([key, value]) => `${key}=${value}`)
			.join("&")}`,
		{
			method: "GET",
			headers: {
				"content-type": "application/json",
			},
		},
	).then((res) => res.json())

	return data as ReturnType<typeof findPath>
}
