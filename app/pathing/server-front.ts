import type { ExcludedRoutes } from "app/data"
import type { findPath } from "."
import { sleep } from "app/utils/sleep"
import { siteURL } from "app/utils/siteURL"

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

	const data = await fetch(
		`${siteURL}/pathing/${from}/${to}/${JSON.stringify(excludedRoutes)}`,
		{
			method: "GET",
			headers: {
				"content-type": "application/json",
			},
		},
	).then((res) => res.json())

	await sleep(2000)

	return data as ReturnType<typeof findPath>
}
