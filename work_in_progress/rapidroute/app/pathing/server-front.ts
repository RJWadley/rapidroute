import type { findPath } from "."

/**
 * find a path between two locations on the server-side
 */
export const findPathInServer = async (
	from: string | undefined | null,
	to: string | undefined | null,
) => {
	console.log("fetching path from server")
	if (typeof window === "undefined") return null

	const data = await fetch(`/pathing?from=${from}&to=${to}`, {
		method: "GET",
		headers: {
			"content-type": "application/json",
		},
	}).then((res) => res.json())

	console.log(data)

	return data as ReturnType<typeof findPath>
}
