import type { findPath } from "."

/**
 * find a path between two locations on the server-side
 */
export const findPathInServer = async (
	from: string | undefined | null,
	to: string | undefined | null,
) => {
	if (typeof window === "undefined") return null
	if (!from || !to) return null

	const data = await fetch(`/pathing?from=${from}&to=${to}`, {
		method: "GET",
		headers: {
			"content-type": "application/json",
		},
	}).then((res) => res.json())

	return data as ReturnType<typeof findPath>
}
